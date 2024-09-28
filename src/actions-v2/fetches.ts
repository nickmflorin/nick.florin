import { cache } from "react";

import superjson, { type SuperJSONResult } from "superjson";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type User } from "~/database/model";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import { convertToPlainObject, type ApiClientError, type ApiClientErrorJson } from "~/api-v2";
import { isApiClientError, ApiClientGlobalError } from "~/api-v2";

import { type ActionVisibility, visibilityIsAdmin } from "./visibility";

export type FetchActionScope = "api" | "action";

export type FetchActionContext = {
  readonly scope?: FetchActionScope;
  readonly strict?: boolean;
  readonly serialized?: boolean;
};

export type FetchActionContextError<C extends FetchActionContext> = C extends { scope: "api" }
  ? ApiClientError
  : ApiClientErrorJson;

export type FetchActionResponseOrError<T, C extends FetchActionContext> =
  | { data: T; error?: never }
  | { data?: never; error: FetchActionContextError<C> };

type IsSerialized<C extends FetchActionContext> = C extends { scope: "api"; serialized: false }
  ? false
  : C extends { scope: "api" }
    ? true
    : C extends { serialized: true }
      ? true
      : false;

const shouldSerialize = <C extends FetchActionContext>(context: C): boolean =>
  context.scope === "api" ? context.serialized !== false : context.serialized === true;

type D<T, C extends FetchActionContext> = IsSerialized<C> extends true ? SuperJSONResult : T;

export type FetchActionResponse<T, C extends FetchActionContext> = C extends {
  strict: true;
}
  ? { data: D<T, C>; error?: never }
  : FetchActionResponseOrError<D<T, C>, C>;

interface ErrorInFetchContextOptions {
  readonly logData?: Record<string, unknown>;
  readonly logMessage?: string;
  readonly log?: boolean;
}

export const errorInFetchContext = <C extends FetchActionContext>(
  error: ApiClientError,
  context: C,
  options?: ErrorInFetchContextOptions,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): FetchActionResponse<any, C> => {
  const { logData = {}, logMessage, log = true } = options ?? {};

  if (context.strict) {
    throw error;
  } else if (context.scope === "api") {
    if (log) {
      logger.error(error, logMessage ?? error.message, logData);
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return { error } as FetchActionResponse<any, C>;
  }
  if (log) {
    logger.error(error, logMessage ?? error.message, logData);
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return { error: error.json } as FetchActionResponse<any, C>;
};

export const dataInFetchContext = <T, C extends FetchActionContext>(
  data: T,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  context: C,
): FetchActionResponse<T, C> =>
  ({
    data: shouldSerialize(context) ? superjson.serialize(data) : convertToPlainObject(data),
  }) as FetchActionResponse<T, C>;

export type StandardFetchActionReturn<R> = Promise<R | ApiClientError>;

interface StandardFetchActionOptions {
  readonly adminOnly?: boolean;
  readonly authenticated?: boolean;
}

type StandardFetchActionUser<O extends StandardFetchActionOptions> = O extends {
  authenticated: true;
}
  ? User
  : User | undefined;

type ListFetchActionFn<
  P extends { visibility: ActionVisibility },
  R,
  O extends StandardFetchActionOptions,
> = (params: P, user: StandardFetchActionUser<O>, isAdmin: boolean) => StandardFetchActionReturn<R>;

type StandardListFetchAction<P extends { visibility: ActionVisibility }, R> = {
  <C extends FetchActionContext>(params: P, context: C): Promise<FetchActionResponse<R, C>>;
};

export const standardListFetchAction = <
  P extends { visibility: ActionVisibility },
  R,
  O extends StandardFetchActionOptions,
>(
  fn: ListFetchActionFn<P, R, O>,
  opts: O,
): StandardListFetchAction<P, R> => {
  const wrapped = async <C extends FetchActionContext>(
    params: P,
    context: C,
  ): Promise<FetchActionResponse<R, C>> => {
    const adminOnly = opts.adminOnly ?? false;
    const authenticated = opts.authenticated ?? true;

    const { error, user, isAdmin } = await getAuthedUser();
    if (error) {
      if (authenticated || adminOnly) {
        return errorInFetchContext(error, context);
      }
      const result = await fn(params, user as StandardFetchActionUser<O>, isAdmin ?? false);
      if (isApiClientError(result)) {
        return errorInFetchContext(result, context);
      }
      return dataInFetchContext(result, context);
    } else if (!isAdmin && (adminOnly || visibilityIsAdmin(params.visibility))) {
      return errorInFetchContext(
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        }),
        context,
      );
    }
    const result = await fn(params, user, isAdmin ?? false);
    if (isApiClientError(result)) {
      return errorInFetchContext(result, context);
    }
    return dataInFetchContext(result, context);
  };
  return cache(wrapped) as typeof wrapped;
};

type DetailFetchActionFn<R, O extends StandardFetchActionOptions> = (
  id: string,
  user: StandardFetchActionUser<O>,
  isAdmin: boolean,
) => StandardFetchActionReturn<R>;

type StandardDetailFetchAction<R> = {
  <C extends FetchActionContext>(id: string, context: C): Promise<FetchActionResponse<R, C>>;
};

export const standardDetailFetchAction = <R, O extends StandardFetchActionOptions>(
  fn: DetailFetchActionFn<R, O>,
  opts: O,
): StandardDetailFetchAction<R> => {
  const wrapped = async <C extends FetchActionContext>(
    id: string,
    context: C,
  ): Promise<FetchActionResponse<R, C>> => {
    const adminOnly = opts.adminOnly ?? false;
    const authenticated = opts.authenticated ?? true;

    const { error, user, isAdmin } = await getAuthedUser();
    if (error) {
      if (authenticated || adminOnly) {
        return errorInFetchContext(error, context);
      } else if (!isUuid(id)) {
        logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a detail.`, {
          id,
        });
        return errorInFetchContext(
          ApiClientGlobalError.NotFound({
            message: "The requested resource was not found.",
          }),
          context,
        );
      }
      const result = await fn(id, user as StandardFetchActionUser<O>, isAdmin ?? false);
      if (isApiClientError(result)) {
        return errorInFetchContext(result, context);
      }
      return dataInFetchContext(result, context);
    } else if (!isAdmin && adminOnly) {
      return errorInFetchContext(
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        }),
        context,
      );
    } else if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a detail.`, {
        id,
      });
      return errorInFetchContext(
        ApiClientGlobalError.NotFound({
          message: "The requested resource was not found.",
        }),
        context,
      );
    }
    const result = await fn(id, user, isAdmin ?? false);
    if (isApiClientError(result)) {
      return errorInFetchContext(result, context);
    }
    return dataInFetchContext(result, context);
  };
  return cache(wrapped) as typeof wrapped;
};

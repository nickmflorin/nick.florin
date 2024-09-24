import { cache } from "react";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type User } from "~/database/model";
import { logger } from "~/internal/logger";

import { convertToPlainObject, type ApiClientError, type ApiClientErrorJson } from "~/api-v2";
import { isApiClientError, ApiClientGlobalError } from "~/api-v2";

import { type ActionVisibility, visibilityIsAdmin } from "./visibility";

export type FetchActionScope = "api" | "action";

export type FetchActionContext = {
  readonly scope?: FetchActionScope;
  readonly strict?: boolean;
};

export type FetchActionContextError<C extends FetchActionContext> = C extends { scope: "api" }
  ? ApiClientError
  : ApiClientErrorJson;

export type FetchActionResponseOrError<T, C extends FetchActionContext> =
  | { data: T; error?: never }
  | { data?: never; error: FetchActionContextError<C> };

export type FetchActionResponse<T, C extends FetchActionContext> = C extends {
  strict: true;
}
  ? { data: T; error?: never }
  : FetchActionResponseOrError<T, C>;

export type MutationActionResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: ApiClientErrorJson };

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
): FetchActionResponse<T, C> => ({ data: convertToPlainObject(data) }) as FetchActionResponse<T, C>;

export type StandardFetchActionReturn<R> = Promise<R | ApiClientError>;

type StandardFetchActionUser<O extends StandardFetchActionOptions> = O extends {
  authenticated: true;
}
  ? User
  : User | undefined;

export type FetchActionFn<
  P extends { visibility: ActionVisibility },
  R,
  O extends StandardFetchActionOptions,
> = (params: P, user: StandardFetchActionUser<O>) => StandardFetchActionReturn<R>;

interface StandardFetchActionOptions {
  readonly adminOnly?: boolean;
  readonly authenticated?: boolean;
}

type StandardFetchAction<P extends { visibility: ActionVisibility }, R> = {
  <C extends FetchActionContext>(params: P, context: C): Promise<FetchActionResponse<R, C>>;
};

export const standardFetchAction = <
  P extends { visibility: ActionVisibility },
  R,
  O extends StandardFetchActionOptions,
>(
  fn: FetchActionFn<P, R, O>,
  opts: O,
): StandardFetchAction<P, R> => {
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
      const result = await fn(params, user as StandardFetchActionUser<O>);
      if (isApiClientError(result)) {
        return errorInFetchContext(result, context);
      }
      return dataInFetchContext(result, context);
    } else if (!isAdmin && (adminOnly || visibilityIsAdmin(params.visibility))) {
      const error = ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
      return errorInFetchContext(error, context);
    }
    const result = await fn(params, user);
    if (isApiClientError(result)) {
      return errorInFetchContext(result, context);
    }
    return dataInFetchContext(result, context);
  };
  return cache(wrapped) as typeof wrapped;
};

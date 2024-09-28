import { cache } from "react";

import superjson, { type SuperJSONResult } from "superjson";
import { type Required } from "utility-types";

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

export type ActionPaginationParams<P extends { filters: Record<string, unknown>; page?: number }> =
  Required<Pick<P, "filters" | "page">, "page">;

export type ActionCountParams<P extends { filters: Record<string, unknown> }> = Pick<P, "filters">;

export type ActionFilterParams<P extends { filters: Record<string, unknown> }> = Pick<
  P,
  "filters"
> & { readonly filterIsVisible: FilterIsVisible };

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

export type FilterIsVisible = (v?: boolean | null) => boolean | undefined;

type ListFetchActionWrappedContext<O extends StandardFetchActionOptions> = {
  readonly user: StandardFetchActionUser<O>;
  readonly isAdmin: boolean;
  readonly isVisible: true | undefined;
  readonly filterIsVisible: FilterIsVisible;
};

type ListFetchActionFn<P, R, O extends StandardFetchActionOptions> = (
  params: P,
  context: ListFetchActionWrappedContext<O>,
) => StandardFetchActionReturn<R>;

type StandardListFetchAction<P extends Record<string, unknown>, R> = {
  <C extends FetchActionContext>(
    params: P & { visibility: ActionVisibility },
    context: C,
  ): Promise<FetchActionResponse<R, C>>;
};

export const standardListFetchAction = <
  P extends Record<string, unknown>,
  R,
  O extends StandardFetchActionOptions,
>(
  fn: ListFetchActionFn<P, R, O>,
  opts: O,
): StandardListFetchAction<P, R> => {
  const wrapped: StandardListFetchAction<P, R> = async <C extends FetchActionContext>(
    params: P & { visibility: ActionVisibility },
    context: C,
  ): Promise<FetchActionResponse<R, C>> => {
    const adminOnly = opts.adminOnly ?? false;
    const authenticated = opts.authenticated ?? true;

    const { error, user, isAdmin: _isAdmin } = await getAuthedUser();
    const isAdmin = _isAdmin ?? false;

    const wrappedContext: ListFetchActionWrappedContext<O> = {
      isAdmin,
      user: user as StandardFetchActionUser<O>,
      isVisible: isAdmin && visibilityIsAdmin(params.visibility) ? undefined : true,
      filterIsVisible: v => {
        if (visibilityIsAdmin(params.visibility)) {
          if (!isAdmin) {
            // This should never happen, because an error should have been previously thrown.
            throw new Error("Unexpectedly received visibility of 'admin' for a non-admin user.");
          }
          return v ?? undefined;
        }
        return true;
      },
    };

    if (error) {
      if (authenticated || adminOnly) {
        return errorInFetchContext(error, context);
      } else if (!isAdmin && visibilityIsAdmin(params.visibility)) {
        return errorInFetchContext(
          ApiClientGlobalError.Forbidden({
            message: "The user does not have permission to access this data.",
          }),
          context,
        );
      }
      const result = await fn(params, wrappedContext);
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
    const result = await fn(params, wrappedContext);
    if (isApiClientError(result)) {
      return errorInFetchContext(result, context);
    }
    return dataInFetchContext(result, context);
  };
  return cache(wrapped) as typeof wrapped;
};

type DetailFetchActionFn<R, O extends StandardFetchActionOptions> = (
  id: string,
  params: DetailFetchActionWrappedContext<O>,
) => StandardFetchActionReturn<R>;

type StandardDetailFetchAction<R> = {
  <C extends FetchActionContext>(
    id: string,
    params: { visibility: ActionVisibility },
    context: C,
  ): Promise<FetchActionResponse<R, C>>;
};

type DetailFetchActionWrappedContext<O extends StandardFetchActionOptions> = {
  readonly user: StandardFetchActionUser<O>;
  readonly isAdmin: boolean;
  readonly isVisible: true | undefined;
};

export const standardDetailFetchAction = <R, O extends StandardFetchActionOptions>(
  fn: DetailFetchActionFn<R, O>,
  opts: O,
): StandardDetailFetchAction<R> => {
  const wrapped = async <C extends FetchActionContext>(
    id: string,
    { visibility }: { visibility: ActionVisibility },
    context: C,
  ): Promise<FetchActionResponse<R, C>> => {
    const adminOnly = opts.adminOnly ?? false;
    const authenticated = opts.authenticated ?? true;

    const { error, user, isAdmin: _isAdmin } = await getAuthedUser();
    const isAdmin = _isAdmin ?? false;

    const wrappedContext: DetailFetchActionWrappedContext<O> = {
      isAdmin,
      user: user as StandardFetchActionUser<O>,
      isVisible: isAdmin && visibilityIsAdmin(visibility) ? undefined : true,
    };

    if (error) {
      if (authenticated || adminOnly) {
        return errorInFetchContext(error, context);
      } else if (!isAdmin && visibilityIsAdmin(visibility)) {
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
      const result = await fn(id, wrappedContext);
      if (isApiClientError(result)) {
        return errorInFetchContext(result, context);
      }
      return dataInFetchContext(result, context);
    } else if (!isAdmin && (adminOnly || visibilityIsAdmin(visibility))) {
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
    const result = await fn(id, wrappedContext);
    if (isApiClientError(result)) {
      return errorInFetchContext(result, context);
    }
    return dataInFetchContext(result, context);
  };
  return cache(wrapped) as typeof wrapped;
};

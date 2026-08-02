import { cache } from 'react';

import { type Required } from 'utility-types';

import type * as SuperJSON from 'superjson';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type User } from '~/database/model';
import { logger } from '~/internal/logger';
import { isUuid } from '~/lib/typeguards';

import {
  type ApiClientError,
  type ApiClientErrorJson,
  ApiClientGlobalError,
  convertToPlainObject,
  isApiClientError,
} from '~/api';

import { type ActionVisibility, visibilityIsAdmin } from './visibility';

type ActionVisibilityParams = {
  readonly forceVisibility?: true;
  readonly visibility: ActionVisibility;
};

export type FetchActionScope = 'action' | 'api';

export type FetchActionContext = {
  readonly scope?: FetchActionScope;
  readonly serialized?: boolean;
  readonly strict?: boolean;
};

export type FetchActionContextError<C extends FetchActionContext> = C extends { scope: 'api' }
  ? ApiClientError
  : ApiClientErrorJson;

export type FetchActionResponseOrError<T, C extends FetchActionContext> =
  { data: T; error?: never } | { data?: never; error: FetchActionContextError<C> };

type IsSerialized<C extends FetchActionContext> = C extends { scope: 'api'; serialized: false }
  ? false
  : C extends { scope: 'api' }
    ? true
    : C extends { serialized: true }
      ? true
      : false;

const shouldSerialize = <C extends FetchActionContext>(context: C): boolean =>
  context.scope === 'api' ? context.serialized !== false : context.serialized === true;

type D<T, C extends FetchActionContext> =
  IsSerialized<C> extends true ? SuperJSON.SuperJSONResult : T;

export type FetchActionResponse<T, C extends FetchActionContext> = C extends {
  strict: true;
}
  ? { data: D<T, C>; error?: never }
  : FetchActionResponseOrError<D<T, C>, C>;

interface ErrorInFetchContextOptions {
  readonly log?: boolean;
  readonly logData?: Record<string, unknown>;
  readonly logMessage?: string;
}

export type ActionPaginationParams<P extends { filters: Record<string, unknown>; page?: number }> =
  Required<Pick<P, 'filters' | 'page'>, 'page'>;

export type ActionCountParams<P extends { filters: Record<string, unknown> }> = Pick<P, 'filters'>;

export type ActionFilterParams<P extends { filters: Record<string, unknown> }> = {
  readonly filterIsVisible: FilterIsVisible;
} & Pick<P, 'filters'>;

export const errorInFetchContext = <C extends FetchActionContext>(
  error: ApiClientError,
  context: C,
  options?: ErrorInFetchContextOptions,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): FetchActionResponse<any, C> => {
  const { log = true, logData = {}, logMessage } = options ?? {};

  if (context.strict) {
    throw error;
  } else if (context.scope === 'api') {
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
  context: C,
): FetchActionResponse<T, C> => {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports -- Temp workaround for tests. */
  const superjson = require('superjson') as typeof SuperJSON;
  return {
    data: shouldSerialize(context) ? superjson.serialize(data) : convertToPlainObject(data),
  } as FetchActionResponse<T, C>;
};

export type StandardFetchActionReturn<R> = Promise<ApiClientError | R>;

export interface StandardFetchActionOptions {
  readonly adminOnly?: boolean;
  readonly authenticated?: boolean;
}

type StandardFetchActionUser<O extends StandardFetchActionOptions> = O extends {
  authenticated: true;
}
  ? User
  : undefined | User;

export type FilterIsVisible = (v?: boolean | null) => boolean | undefined;

type ListFetchActionWrappedContext<O extends StandardFetchActionOptions> = {
  readonly filterIsVisible: FilterIsVisible;
  readonly isAdmin: boolean;
  readonly isVisible: true | undefined;
  readonly user: StandardFetchActionUser<O>;
  readonly visibility: ActionVisibility;
};

type ListFetchActionFn<P, R, O extends StandardFetchActionOptions> = (
  params: P,
  context: ListFetchActionWrappedContext<O>,
) => StandardFetchActionReturn<R>;

type StandardListFetchAction<P extends Record<string, unknown>, R> = <C extends FetchActionContext>(
  params: ActionVisibilityParams & P,
  context: C,
) => Promise<FetchActionResponse<R, C>>;

export const standardListFetchAction = <
  P extends Record<string, unknown>,
  R,
  O extends StandardFetchActionOptions,
>(
  fn: ListFetchActionFn<P, R, O>,
  opts: O,
): StandardListFetchAction<P, R> => {
  const wrapped: StandardListFetchAction<P, R> = async <C extends FetchActionContext>(
    params: ActionVisibilityParams & P,
    context: C,
  ): Promise<FetchActionResponse<R, C>> => {
    const adminOnly = opts.adminOnly ?? false;
    const authenticated = opts.authenticated ?? true;

    const { error, isAdmin: _isAdmin, user } = await getAuthedUser();
    const isAdmin = _isAdmin ?? false;

    const wrappedContext: ListFetchActionWrappedContext<O> = {
      filterIsVisible: v => {
        if (visibilityIsAdmin(params.visibility)) {
          if (!isAdmin && !params.forceVisibility) {
            // This should never happen, because an error should have been previously thrown.
            throw new Error("Unexpectedly received visibility of 'admin' for a non-admin user.");
          }
          return v ?? undefined;
        }
        return true;
      },
      isAdmin,
      isVisible:
        (isAdmin || params.forceVisibility) && visibilityIsAdmin(params.visibility)
          ? undefined
          : true,
      user: user as StandardFetchActionUser<O>,
      visibility: params.visibility,
    };

    if (error) {
      if (authenticated || adminOnly) {
        return errorInFetchContext(error, context);
      } else if (!isAdmin && !params.forceVisibility && visibilityIsAdmin(params.visibility)) {
        return errorInFetchContext(
          ApiClientGlobalError.Forbidden({
            message: 'The user does not have permission to access this data.',
          }),
          context,
        );
      }
      const result = await fn(params, wrappedContext);
      if (isApiClientError(result)) {
        return errorInFetchContext(result, context);
      }
      return dataInFetchContext(result, context);
    } else if (
      (!isAdmin && adminOnly) ||
      (!isAdmin && !params.forceVisibility && visibilityIsAdmin(params.visibility))
    ) {
      return errorInFetchContext(
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
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
  return cache(wrapped);
};

type DetailFetchActionFn<
  P extends Record<string, unknown>,
  R,
  O extends StandardFetchActionOptions,
> = (
  id: string,
  params: P,
  context: DetailFetchActionWrappedContext<O>,
) => StandardFetchActionReturn<R>;

type StandardDetailFetchAction<P extends Record<string, unknown>, R> = <
  C extends FetchActionContext,
>(
  id: string,
  params: ActionVisibilityParams & P,
  context: C,
) => Promise<FetchActionResponse<R, C>>;

type DetailFetchActionWrappedContext<O extends StandardFetchActionOptions> = {
  readonly isAdmin: boolean;
  readonly isVisible: true | undefined;
  readonly user: StandardFetchActionUser<O>;
  readonly visibility: ActionVisibility;
};

export const standardDetailFetchAction = <
  P extends Record<string, unknown>,
  R,
  O extends StandardFetchActionOptions,
>(
  fn: DetailFetchActionFn<P, R, O>,
  opts: O,
): StandardDetailFetchAction<P, R> => {
  const wrapped = async <C extends FetchActionContext>(
    id: string,
    params: ActionVisibilityParams & P,
    context: C,
  ): Promise<FetchActionResponse<R, C>> => {
    const adminOnly = opts.adminOnly ?? false;
    const authenticated = opts.authenticated ?? true;

    const { error, isAdmin: _isAdmin, user } = await getAuthedUser();
    const isAdmin = _isAdmin ?? false;

    const wrappedContext: DetailFetchActionWrappedContext<O> = {
      isAdmin,
      isVisible: isAdmin && visibilityIsAdmin(params.visibility) ? undefined : true,
      user: user as StandardFetchActionUser<O>,
      visibility: params.visibility,
    };

    if (error) {
      if (authenticated || adminOnly) {
        return errorInFetchContext(error, context);
      } else if (!isAdmin && !params.forceVisibility && visibilityIsAdmin(params.visibility)) {
        return errorInFetchContext(
          ApiClientGlobalError.Forbidden({
            message: 'The user does not have permission to access this data.',
          }),
          context,
        );
      } else if (!isUuid(id)) {
        logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a detail route.`, {
          id,
        });
        return errorInFetchContext(
          ApiClientGlobalError.NotFound({
            message: 'The requested resource was not found.',
          }),
          context,
        );
      }
      const result = await fn(id, params, wrappedContext);
      if (isApiClientError(result)) {
        return errorInFetchContext(result, context);
      }
      return dataInFetchContext(result, context);
    } else if (
      (!isAdmin && adminOnly) ||
      (!isAdmin && !params.forceVisibility && visibilityIsAdmin(params.visibility))
    ) {
      return errorInFetchContext(
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        }),
        context,
      );
    } else if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a detail route.`, {
        id,
      });
      return errorInFetchContext(
        ApiClientGlobalError.NotFound({
          message: 'The requested resource was not found.',
        }),
        context,
      );
    }
    const result = await fn(id, params, wrappedContext);
    if (isApiClientError(result)) {
      return errorInFetchContext(result, context);
    }
    return dataInFetchContext(result, context);
  };
  return cache(wrapped);
};

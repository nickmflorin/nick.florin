import { useState } from 'react';

import useRootSWR, { type Arguments, type SWRResponse as RootSWRResponse, useSWRConfig } from 'swr';
import { type PublicConfiguration, type SWRConfiguration } from 'swr/_internal';

import { apiClient, type ApiClientError, type ApiError, isApiError } from '~/api';
import {
  type HttpNetworkError,
  type HttpSerializationError,
  type QueryParamObj,
} from '~/integrations/http';

type ApiPath = `/api/${string}`;
type Args = ApiPath | Exclude<Arguments, string>;
export type Key = (() => Args) | Args;

export type SWRConfig<T, Q extends QueryParamObj = QueryParamObj> = {
  readonly onError?: (e: ApiError) => void;
  readonly onSuccess?: (data: T, query: Q) => void;
  readonly query: Q;
} & Omit<
  SWRConfiguration<T, ApiClientError | HttpNetworkError | HttpSerializationError>,
  | 'onError'
  | 'onSuccess'
  /* The 'shouldRetryOnError' configuration parameter is set globally in the <SWRConfig> component
     and should not be overridden. */
  | 'shouldRetryOnError'
>;

export type SWRResponse<T> = {
  readonly controller: AbortController;
  readonly initialResponseReceived: boolean;
  readonly isInitialLoading: boolean;
  readonly isRefetching: boolean;
} & RootSWRResponse<T, ApiError>;

const shouldFetch = (k: Key) => ![false, null, undefined].includes(k as boolean | null | undefined);

export const useSWR = <T, Q extends QueryParamObj = QueryParamObj>(
  path: Key,
  { onError: _onError, query, ...config }: SWRConfig<T, Q>,
): SWRResponse<T> => {
  /* Whether a response, successful or not, has come back at least once.  This is held in state
     rather than in a ref because it distinguishes the initial load from a refetch, which the
     consumer renders differently. */
  const [initialResponseReceived, setInitialResponseReceived] = useState<boolean>(false);

  const { onError } = useSWRConfig();

  const abortController = new AbortController();

  const fetcher = ([p, q]: [Key, Q]) =>
    apiClient.get(p as string, q, {
      processed: true,
      signal: abortController.signal,
      strict: true,
    });

  const { data, error, ...others } = useRootSWR<T, ApiError, [Key, Q] | null>(
    shouldFetch(path) ? [path, query] : null,
    fetcher,
    {
      ...config,
      onError: (e: unknown, key, c) => {
        setInitialResponseReceived(true);

        /* The globally configured `onError` callback must be called first, so that global error
           handling, such as logging, is not skipped when a per-call `onError` callback is also
           provided. */
        onError(e, key, c as PublicConfiguration);

        /* An error that is not an expected ApiClientError or HttpError is expected to have already
           been thrown by the global error handler above.  This check is still repeated here for
           type safety. */
        if (isApiError(e)) {
          return _onError?.(e);
        }
        /* Rethrowing forces the useSWR call to throw the error, instead of embedding it in the
           hook's return. */
        throw e;
      },
      onSuccess: d => {
        setInitialResponseReceived(true);
        config.onSuccess?.(d, query);
      },
    },
  );

  if (error && !isApiError(error)) {
    throw error;
  }

  return {
    controller: abortController,
    data,
    error,
    initialResponseReceived,
    isInitialLoading: others.isLoading && !initialResponseReceived,
    isRefetching: initialResponseReceived && others.isLoading,
    ...others,
  } as SWRResponse<T>;
};

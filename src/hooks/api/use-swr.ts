import { useRef } from "react";

import useRootSWR, { useSWRConfig, type SWRResponse as RootSWRResponse, type Arguments } from "swr";
import { type SWRConfiguration, type PublicConfiguration } from "swr/_internal";

import { apiClient, isApiError, type ApiClientError, type ApiError } from "~/api";
import {
  type HttpNetworkError,
  type HttpSerializationError,
  type QueryParamObj,
} from "~/integrations/http";

type ApiPath = `/api/${string}`;
type Args = Exclude<Arguments, string> | ApiPath;
export type Key = Args | (() => Args);

export type SWRConfig<T, Q extends QueryParamObj = QueryParamObj> = Omit<
  SWRConfiguration<T, ApiClientError | HttpNetworkError | HttpSerializationError>,
  /* The 'shouldRetryOnError' configuration parameter is set globally in the <SWRConfig> component
     and should not be overridden. */
  "shouldRetryOnError" | "onError" | "onSuccess"
> & {
  readonly query: Q;
  readonly onError?: (e: ApiError) => void;
  readonly onSuccess?: (data: T, query: Q) => void;
};

export type SWRResponse<T> = RootSWRResponse<T, ApiError> & {
  readonly initialResponseReceived: boolean;
  readonly isInitialLoading: boolean;
  readonly isRefetching: boolean;
  readonly controller: AbortController;
};

const shouldFetch = (k: Key) => ![null, undefined, false].includes(k as null | undefined | boolean);

export const useSWR = <T, Q extends QueryParamObj = QueryParamObj>(
  path: Key,
  { onError: _onError, query, ...config }: SWRConfig<T, Q>,
): SWRResponse<T> => {
  const initialResponseReceived = useRef<boolean>(false);

  /* If the `onError` configuration callback is provided, it is very important that the globally
       configured `onError` configuration callback is *still* called beforehand. */
  const { onError } = useSWRConfig();

  // TODO: Investigate whether or not it is necessary to abort requests if the pathname changes.
  const abortController = new AbortController();

  const fetcher = ([p, q]: [Key, Q]) =>
    apiClient.get(p as string, q, {
      strict: true,
      processed: true,
      signal: abortController.signal,
    });

  const { data, error, ...others } = useRootSWR<T, ApiError, [Key, Q] | null>(
    shouldFetch(path) ? [path, query] : null,
    fetcher,
    {
      ...config,
      onSuccess: d => {
        initialResponseReceived.current = true;
        config.onSuccess?.(d, query);
      },
      onError: (e: unknown, key, c) => {
        initialResponseReceived.current = true;

        // It is important that the globally configured onError callback is called first.
        onError(e, key, c as PublicConfiguration);

        /* If the error is not an expected ApiClientError or HttpError, it should have already been
           thrown by the global error handler above.  However, we still need to repeat that check
           for type safety here. */
        if (isApiError(e)) {
          return _onError?.(e);
        }
        /* This will force the useSWR call to throw the error, instead of embedding the error in the
           hook's return. */
        throw e;
      },
    },
  );

  if (error && !isApiError(error)) {
    throw error;
  }

  return {
    data,
    error,
    initialResponseReceived: initialResponseReceived.current,
    isRefetching: initialResponseReceived.current && others.isLoading,
    isInitialLoading: others.isLoading && !initialResponseReceived.current,
    controller: abortController,
    ...others,
  } as SWRResponse<T>;
};

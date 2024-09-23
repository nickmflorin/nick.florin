import { useRef } from "react";

import useRootSWR, { useSWRConfig, type SWRResponse as RootSWRResponse, type Arguments } from "swr";
import { type SWRConfiguration, type PublicConfiguration } from "swr/_internal";

import { apiClient, isApiClientError, type ApiClientError } from "~/api-v2";
import {
  isHttpError,
  type HttpNetworkError,
  type HttpSerializationError,
  type QueryParamObj,
} from "~/integrations/http-v2";

type ApiPath = `/api/${string}`;
type Args = Exclude<Arguments, string> | ApiPath;
export type Key = Args | (() => Args);

export type SWRError = ApiClientError | HttpNetworkError | HttpSerializationError;

export type SWRConfig<T, Q extends QueryParamObj = QueryParamObj> = Omit<
  SWRConfiguration<T, ApiClientError | HttpNetworkError | HttpSerializationError>,
  /* The 'shouldRetryOnError' configuration parameter is set globally in the <SWRConfig> component
     and should not be overridden. */
  "shouldRetryOnError" | "onError" | "onSuccess"
> & {
  readonly query: Q;
  readonly onError?: (e: SWRError) => void;
  readonly onSuccess?: (data: T, query: Q) => void;
};

export type SWRResponse<T> = RootSWRResponse<T, SWRError> & {
  readonly initialResponseReceived: boolean;
  readonly isInitialLoading: boolean;
  readonly isRefetching: boolean;
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

  const { data, error, ...others } = useRootSWR<T, SWRError, [Key, Q] | null>(
    shouldFetch(path) ? [path, query] : null,
    ([p, q]) => apiClient.get(p as string, q, { strict: true, processed: true }),
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
        if (isApiClientError(e) || isHttpError(e)) {
          return _onError?.(e);
        }
        /* This will force the useSWR call to throw the error, instead of embedding the error in the
           hook's return. */
        throw e;
      },
    },
  );

  if (error && !isHttpError(error)) {
    throw error;
  }

  return {
    data,
    error,
    initialResponseReceived: initialResponseReceived.current,
    isRefetching: initialResponseReceived.current && others.isLoading,
    isInitialLoading: others.isLoading && !initialResponseReceived.current,
    ...others,
  } as SWRResponse<T>;
};

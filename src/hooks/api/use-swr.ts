import { useRef } from "react";

import superjson, { type SuperJSONResult } from "superjson";
import useRootSWR, { useSWRConfig, type SWRResponse as RootSWRResponse, type Arguments } from "swr";
import { type SWRConfiguration, type PublicConfiguration } from "swr/_internal";

import {
  type QueryParams,
  addQueryParamsToUrl,
  type QueryParamValue,
  encodeQueryParams,
} from "~/lib/urls";
import {
  isApiClientGlobalErrorJson,
  isApiClientFormErrorJson,
  ClientError,
  NetworkError,
  ApiClientGlobalError,
  ApiClientFormError,
  MalformedJsonError,
  ServerError,
  type HttpError,
  isHttpError,
} from "~/http";

type ApiPath = `/api/${string}`;
type Args = Exclude<Arguments, string> | ApiPath;
export type Key = Args | (() => Args);

type FetchResponseBody = { data: SuperJSONResult } | SuperJSONResult;

const isSuccessResponseBody = (b: FetchResponseBody): b is { data: SuperJSONResult } =>
  typeof b === "object" && b !== null && (b as { data: SuperJSONResult }).data != undefined;

export const swrFetcher = async <T>(
  path: ApiPath,
  query?: QueryParams<"record", QueryParamValue>,
) => {
  const url = query ? addQueryParamsToUrl(path, encodeQueryParams(query)) : path;
  let response: Response | null = null;
  try {
    response = await fetch(url);
  } catch (e) {
    // This will occur if a connection cannot be established between the client and the server.
    throw new NetworkError({ url });
  }
  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) {
      let json: FetchResponseBody;
      try {
        json = await response.json();
      } catch (e) {
        /* If the status code is 4xx but we cannot parse the JSON respnose body, it is not from
           our API routes directly.  We will have to infer the type of error from the status code
           of the response. */
        throw ClientError.reconstruct(response);
      }
      if (isSuccessResponseBody(json)) {
        throw new MalformedJsonError({
          url,
          statusCode: response.status,
          message:
            "The response body indicates a successful response when the response status " +
            "code does not.",
        });
      }
      const deserialized = superjson.deserialize(json);
      if (isApiClientGlobalErrorJson(deserialized)) {
        throw ApiClientGlobalError.reconstruct(deserialized);
      } else if (isApiClientFormErrorJson(deserialized)) {
        throw ApiClientFormError.reconstruct(deserialized);
      }
      throw ClientError.reconstruct(response);
    } else if (response.status === 500) {
      throw new ServerError({ url });
    }
    /* This could be 5xx error that is not an internal server error.  For right now, we will simply
       throw an error that will cause SWR to throw as well, and not include the error in the
       hook's return.  We might want to eventually expand the concept of an HttpError to account
       for additional errors here. */
    throw new Error(`Unexpectedly received ${response.status} response status!`);
  }
  /* Note: Parsing the JSON will fail if the route does not yet exist, in which case the response
     is HTML from NextJS's 404 page.  In this case, just let it fail - we don't want to treat it as
     a client error since it is a bug in the code and should not be disguised. */
  const json: FetchResponseBody = await response.json();
  if (isSuccessResponseBody(json)) {
    const deserialized = superjson.deserialize(json.data);
    if (deserialized === undefined) {
      throw new MalformedJsonError({
        url,
        statusCode: response.status,
        message: "The response body could not be deserialized.",
      });
    }
    /* TODO: We might want to incorporate zod schemas for type validation here - the type safety
       needs to be improved. */
    return deserialized as T;
  }
  throw new MalformedJsonError({
    url,
    statusCode: response.status,
    message:
      "The response body indicates a failed response when the response status code does not.",
  });
};

export type SWRConfig<T> = Omit<
  SWRConfiguration<T, HttpError>,
  /* The 'shouldRetryOnError' configuration parameter is set globally in the <SWRConfig> component
     and should not be overridden. */
  "shouldRetryOnError" | "onError" | "onSuccess"
> & {
  readonly query?: QueryParams<"record", QueryParamValue | string[] | number[]>;
  readonly onError?: (e: HttpError) => void;
  readonly onSuccess?: (data: T) => void;
};

export type SWRResponse<T> = RootSWRResponse<T, HttpError> & {
  readonly initialResponseReceived: boolean;
  readonly isInitialLoading: boolean;
  readonly isRefetching: boolean;
};

const shouldFetch = (k: Key) => ![null, undefined, false].includes(k as null | undefined | boolean);

export const useSWR = <T>(
  path: Key,
  { onError: _onError, query, ...config }: SWRConfig<T>,
): SWRResponse<T> => {
  const initialResponseReceived = useRef<boolean>(false);

  /* If the `onError` configuration callback is provided, it is very important that the globally
       configured `onError` configuration callback is *still* called beforehand. */
  const { onError } = useSWRConfig();

  const { data, error, ...others } = useRootSWR(
    shouldFetch(path) ? [path, query] : null,
    ([p, q]) => swrFetcher<T>(p as ApiPath, q),
    {
      ...config,
      onSuccess: d => {
        initialResponseReceived.current = true;
        config.onSuccess?.(d);
      },
      onError: (e: unknown, key, c) => {
        initialResponseReceived.current = true;
        // It is important that the globally configured onError callback is called first.
        onError(e, key, c as PublicConfiguration);
        if (isHttpError(e)) {
          return _onError?.(e);
        }
        if (e instanceof NetworkError || e instanceof ClientError) {
          return _onError?.(e);
        }
        /* This will force the useSWR call to throw the error, instead of embedding the error in the
           hook's return. */
        throw e;
      },
    },
  );

  return {
    data,
    error,
    initialResponseReceived: initialResponseReceived.current,
    isRefetching: initialResponseReceived.current && others.isLoading,
    isInitialLoading: others.isLoading && !initialResponseReceived.current,
    ...others,
  } as SWRResponse<T>;
};

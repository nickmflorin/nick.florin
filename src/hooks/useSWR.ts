import superjson, { type SuperJSONResult } from "superjson";
import useRootSWR, { useSWRConfig, type SWRResponse as RootSWRResponse } from "swr";
import { type SWRConfiguration, type PublicConfiguration } from "swr/_internal";

import {
  isClientErrorResponseBody,
  ClientError,
  NetworkError,
  MalformedJsonError,
  ServerError,
  type HttpError,
  isHttpError,
} from "~/application/errors";

type FetchResponseBody = { data: SuperJSONResult } | SuperJSONResult;

const isSuccessResponseBody = (b: FetchResponseBody): b is { data: SuperJSONResult } =>
  typeof b === "object" && b !== null && (b as { data: SuperJSONResult }).data != undefined;

export const swrFetcher = async <T>(url: string) => {
  let response: Response | null = null;
  try {
    response = await fetch(url);
  } catch (e) {
    // This will occur if a connection cannot be established between the client and the server.
    throw new NetworkError(url);
  }
  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) {
      const json: FetchResponseBody = await response.json();
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
      if (isClientErrorResponseBody(deserialized)) {
        throw ClientError.reconstruct(deserialized);
      }
    } else if (response.status === 500) {
      throw new ServerError({ url });
    }
    /* This could be 5xx error that is not an internal server error.  For right now, we will simply
       throw an error that will cause SWR to throw as well, and not include the error in the
       hook's return.  We might want to eventually expand the concept of an HttpError to account
       for additional errors here. */
    throw new Error(`Unexpectedly received ${response.status} response status!`);
  }
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
  readonly onError?: (e: HttpError) => void;
  readonly onSuccess?: (data: T) => void;
};

export type SWRResponse<T> = RootSWRResponse<T, HttpError>;

export const useSWR = <T>(
  url: string,
  { onError: _onError, ...config }: SWRConfig<T>,
): SWRResponse<T> => {
  /* If the `onError` configuration callback is provided, it is very important that the globally
       configured `onError` configuration callback is *still* called beforehand. */
  const { onError } = useSWRConfig();

  const { data, error, ...others } = useRootSWR(url, swrFetcher<T>, {
    ...config,
    onError: (e: unknown, key, c) => {
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
  });
  return { data, error, ...others } as SWRResponse<T>;
};

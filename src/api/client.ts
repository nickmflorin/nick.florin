import { type SuperJSONResult } from "superjson";
import superjson from "superjson";

import { logger } from "~/internal/logger";

import { isSuperJsonResult } from "~/api/serialization";
import { isApiClientFormErrorJson, isApiClientGlobalErrorJson } from "~/api/types";
import {
  HttpClient,
  type ClientOkResponseProcessor,
  type ClientNotOkResponseProcessor,
  HttpSerializationError,
  HttpNetworkError,
} from "~/integrations/http";

import { type ApiClientError, ApiClientFormError, ApiClientGlobalError } from "./errors";

const isSuccessResponseBody = (b: unknown): b is { data: SuperJSONResult } =>
  typeof b === "object" &&
  b !== null &&
  (b as { data: SuperJSONResult }).data != undefined &&
  isSuperJsonResult((b as { data: SuperJSONResult }).data);

const isErrorResponseBody = (b: unknown): b is { error: SuperJSONResult } =>
  typeof b === "object" &&
  b !== null &&
  (b as { error: SuperJSONResult }).error != undefined &&
  isSuperJsonResult((b as { error: SuperJSONResult }).error);

const processors: {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly okayResponseProcessor: ClientOkResponseProcessor<any, HttpSerializationError>;
  readonly notOkayResponseProcessor: ClientNotOkResponseProcessor<ApiClientError>;
} = {
  notOkayResponseProcessor: async (response): Promise<ApiClientError> => {
    let json: unknown;
    try {
      json = await response.json();
    } catch (e) {
      /* If the status code is 4xx or 5xx, it is not guaranteed that the response came from us.
         For instance, NextJS can return a 404 response for an API endpoint if the path has not
         been included in the statically generated paths on build time.  In this case, we will
         may not be able to parse the error JSON from the response, because it may not have a JSON
         body.  */
      logger.info(
        `Failed to parse JSON response body on response with status '${response.status}'!`,
        { response },
      );
      return ApiClientGlobalError.reconstruct(response);
    }
    if (isSuccessResponseBody(json)) {
      logger.error(
        `The response body for response with status '${response.status}' indicates a successful ` +
          "request when the status code does not!",
        { response, json },
      );
      return ApiClientGlobalError.reconstruct(response);
    } else if (isErrorResponseBody(json)) {
      const deserialized = superjson.deserialize(json.error);
      if (isApiClientGlobalErrorJson(deserialized)) {
        return ApiClientGlobalError.fromJson(deserialized);
      } else if (isApiClientFormErrorJson(deserialized)) {
        return ApiClientFormError.fromJson(deserialized);
      }
    }
    /* There are cases where the JSON result is not a superjson result, and is not coming directly
       and explicitly from an API route.  For instance, this can happen if Clerk prevents the
       client from communicating with an API route because it is not in the public routes
       configuration of the middleware (in which case the JSON value of the response is 'null').

       If the JSON value is not a SuperJSONResult, we have to fallback on more general
       reconstruction of the error based on the response's status code. */
    return ApiClientGlobalError.reconstruct(response);
  },
  okayResponseProcessor: async (response, params) => {
    try {
      const data = await response.json();
      if (isSuccessResponseBody(data)) {
        return { data: data.data.json };
      }
    } catch (e) {
      return { error: new HttpSerializationError(params) };
    }
    throw new Error(
      "Received a successful response where the data did not conform to the expected shape!",
    );
  },
};

export const apiClient = new HttpClient({
  processors,
  NetworkErrorClass: HttpNetworkError,
});

import type * as SuperJSON from 'superjson';

import { logger } from '~/internal/logger';

import { isSuperJsonResult } from '~/api/serialization';
import { isApiClientFormErrorJson, isApiClientGlobalErrorJson } from '~/api/types';
import {
  type ClientNotOkResponseProcessor,
  type ClientOkResponseProcessor,
  HttpClient,
  HttpNetworkError,
  HttpSerializationError,
  type InferredClientResponseOrError,
} from '~/integrations/http';

import { type ApiClientError, ApiClientFormError, ApiClientGlobalError } from './errors';

const isSuccessResponseBody = (b: unknown): b is { data: SuperJSON.SuperJSONResult } =>
  typeof b === 'object' && b !== null && 'data' in b && isSuperJsonResult(b.data);

const isErrorResponseBody = (b: unknown): b is { error: SuperJSON.SuperJSONResult } =>
  typeof b === 'object' && b !== null && 'error' in b && isSuperJsonResult(b.error);

/**
 * Reconstructs a global API client error from a response whose body could not be parsed as JSON.
 *
 * When the status code is 4xx or 5xx, it is not guaranteed that the response came from the API
 * layer the client expects. For instance, NextJS can return a 404 response for an API endpoint
 * whose path was not included in the statically generated paths at build time, in which case the
 * response may not have a JSON body to parse.
 *
 * @param {Response} response The response whose body could not be parsed.
 *
 * @returns {ApiClientGlobalError} The reconstructed global error.
 */
const reconstructErrorFromUnparsableResponse = (response: Response): ApiClientGlobalError => {
  logger.info(`Failed to parse JSON response body on response with status '${response.status}'!`, {
    response,
  });
  return ApiClientGlobalError.reconstruct(response);
};

/**
 * Reconstructs a global API client error from a response whose JSON body was not a
 * {@link SuperJSON.SuperJSONResult}, and did not otherwise indicate a recognized API client error.
 *
 * This can happen when the response does not come directly from an API route - for instance, if
 * Clerk prevents the client from communicating with an API route because it is not included in
 * the public routes configuration of the middleware, in which case the response's JSON value is
 * `null`. General reconstruction of the error, based only on the response's status code, is the
 * only option left in that case.
 *
 * @param {Response} response The response whose body was not a recognized error shape.
 *
 * @returns {ApiClientGlobalError} The reconstructed global error.
 */
const reconstructErrorFromUnrecognizedResponseBody = (response: Response): ApiClientGlobalError =>
  ApiClientGlobalError.reconstruct(response);

const processors: {
  readonly notOkayResponseProcessor: ClientNotOkResponseProcessor<ApiClientError>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly okayResponseProcessor: ClientOkResponseProcessor<any, HttpSerializationError>;
} = {
  notOkayResponseProcessor: async (response): Promise<ApiClientError> => {
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return reconstructErrorFromUnparsableResponse(response);
    }
    if (isSuccessResponseBody(json)) {
      logger.error(
        `The response body for response with status '${response.status}' indicates a successful ` +
          'request when the status code does not!',
        { json, response },
      );
      return ApiClientGlobalError.reconstruct(response);
    } else if (isErrorResponseBody(json)) {
      /* eslint-disable-next-line @typescript-eslint/no-require-imports
         -- Tmp workaround for tests. */
      const superjson = require('superjson') as typeof SuperJSON;

      const deserialized = superjson.deserialize(json.error);
      if (isApiClientGlobalErrorJson(deserialized)) {
        return ApiClientGlobalError.fromJson(deserialized);
      } else if (isApiClientFormErrorJson(deserialized)) {
        return ApiClientFormError.fromJson(deserialized);
      }
    }
    return reconstructErrorFromUnrecognizedResponseBody(response);
  },
  okayResponseProcessor: async (response, params) => {
    try {
      const data: unknown = await response.json();
      if (isSuccessResponseBody(data)) {
        /* eslint-disable-next-line @typescript-eslint/no-require-imports -- Tmp for tests. */
        const superjson = require('superjson') as typeof SuperJSON;
        return { data: superjson.deserialize<unknown>(data.data) };
      }
    } catch {
      return { error: new HttpSerializationError(params) };
    }
    throw new Error(
      'Received a successful response where the data did not conform to the expected shape!',
    );
  },
};

export const apiClient = new HttpClient({
  NetworkErrorClass: HttpNetworkError,
  processors,
});

export type ApiClientResponseOrError<T> = InferredClientResponseOrError<T, typeof apiClient>;

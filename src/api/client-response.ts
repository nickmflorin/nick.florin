import { type ClientSuccessConfig, ClientSuccess } from "./client-success";
import { ApiClientErrorCodes } from "./codes";
import { type ApiClientErrorConfig, ApiClientError } from "./errors";
import {
  type ClientSuccessResponseBody,
  type ApiClientFieldErrors,
  type ApiClientErrorResponse,
} from "./types";

export type ClientResponseConfig<T> = ApiClientErrorConfig | ClientSuccessConfig<T>;

export type ClientResponseBody<T> = ClientSuccessResponseBody<T> | ApiClientErrorResponse;

const isErrorConfig = <T>(config: ClientResponseConfig<T>): config is ApiClientErrorConfig =>
  (config as ApiClientErrorConfig).code !== undefined &&
  ApiClientErrorCodes.contains((config as ApiClientErrorConfig).code);

type ClientResponseRT<T, C extends ClientResponseConfig<T>> = C extends ApiClientErrorConfig<
  infer M extends ApiClientFieldErrors | string
>
  ? ApiClientError<M>
  : ClientSuccess<T>;

export const ClientResponse = <T, C extends ClientResponseConfig<T>>(
  config: C,
): ClientResponseRT<T, C> => {
  if (isErrorConfig(config)) {
    return new ApiClientError(config) as ClientResponseRT<T, C>;
  }
  return new ClientSuccess<T>(config) as ClientResponseRT<T, C>;
};

ClientResponse.OK = ClientSuccess.OK;
ClientResponse.BadRequest = ApiClientError.BadRequest;
ClientResponse.NotAuthenticated = ApiClientError.NotAuthenticated;
ClientResponse.Forbidden = ApiClientError.Forbidden;
ClientResponse.NotFound = ApiClientError.NotFound;

import {
  type ClientErrorConfig,
  ClientError,
  type ClientErrorCode,
  type ClientErrorResponseBody,
  ClientErrorCodes,
} from "../errors";

import { type ClientSuccessConfig, ClientSuccess } from "./client-success";
import { type ClientSuccessResponseBody } from "./types";

export type ClientResponseConfig<T> = ClientErrorConfig | ClientSuccessConfig<T>;

export type ClientResponseBody<T> = ClientSuccessResponseBody<T> | ClientErrorResponseBody;

const isErrorConfig = <T>(config: ClientResponseConfig<T>): config is ClientErrorConfig =>
  (config as ClientErrorConfig).code !== undefined &&
  ClientErrorCodes.contains((config as ClientErrorConfig).code);

type ClientResponseRT<T, C extends ClientResponseConfig<T>> = C extends
  | ClientErrorCode
  | ClientErrorConfig
  ? ClientError
  : ClientSuccess<T>;

export const ClientResponse = <T, C extends ClientResponseConfig<T>>(
  config: C,
): ClientResponseRT<T, C> => {
  if (isErrorConfig(config)) {
    return new ClientError<ClientErrorConfig>(config) as ClientResponseRT<T, C>;
  }
  return new ClientSuccess<T>(config) as ClientResponseRT<T, C>;
};

ClientResponse.OK = ClientSuccess.OK;
ClientResponse.BadRequest = ClientError.BadRequest;
ClientResponse.NotAuthenticated = ClientError.NotAuthenticated;
ClientResponse.Forbidden = ClientError.Forbidden;
ClientResponse.NotFound = ClientError.NotFound;

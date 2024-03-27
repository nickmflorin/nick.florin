import { isError } from "~/application/errors";

import { ApiClientFormError, ApiClientGlobalError } from "./api-client-error";
import { ClientError } from "./client-error";
import { NetworkError } from "./network-error";
import { ServerError } from "./server-error";

export * from "./client-error";
export * from "./malformed-json-error";
export * from "./network-error";
export * from "./server-error";
export * from "./api-client-error";

export type ApiError = NetworkError | ServerError | ApiClientGlobalError | ApiClientFormError;
export type HttpError = ApiError | ClientError;

export const isApiError = (e: unknown): e is HttpError =>
  isError(e) &&
  (e instanceof ApiClientGlobalError ||
    e instanceof ApiClientFormError ||
    e instanceof NetworkError ||
    e instanceof ServerError);

export const isHttpError = (e: unknown): e is HttpError =>
  isApiError(e) || (isError(e) && e instanceof ClientError);

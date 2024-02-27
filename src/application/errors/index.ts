import { ApiClientError, ClientError } from "./client-error";
import { NetworkError } from "./network-error";
import { ServerError } from "./server-error";

export * from "./client-error";
export * from "./network-error";
export * from "./malformed-json-error";
export * from "./server-error";

export type ApiError = NetworkError | ServerError | ApiClientError;
export type HttpError = ApiError | ClientError;

export const isError = (e: unknown): e is Error =>
  typeof e === "object" &&
  e !== null &&
  (e as Error).stack !== undefined &&
  (e as Error).message !== undefined;

export const isApiError = (e: unknown): e is HttpError =>
  isError(e) &&
  (e instanceof ApiClientError || e instanceof NetworkError || e instanceof ServerError);

export const isHttpError = (e: unknown): e is HttpError =>
  isApiError(e) || (isError(e) && e instanceof ClientError);

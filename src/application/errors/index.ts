import { ApiClientError, ClientError } from "./client-error";
import { NetworkError } from "./network-error";
import { ServerError } from "./server-error";

export * from "./client-error";
export * from "./network-error";
export * from "./malformed-json-error";
export * from "./server-error";

export type HttpError = NetworkError | ClientError | ServerError;

export const isError = (e: unknown): e is Error =>
  typeof e === "object" &&
  e !== null &&
  (e as Error).stack !== undefined &&
  (e as Error).message !== undefined;

export const isHttpError = (e: unknown): e is HttpError =>
  isError(e) &&
  (e instanceof ClientError ||
    e instanceof ApiClientError ||
    e instanceof NetworkError ||
    e instanceof ServerError);

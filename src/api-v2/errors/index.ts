import { isError } from "~/application/errors";

import { ApiClientFormError } from "./api-client-form-error";
import { ApiClientGlobalError } from "./api-client-global-error";

export * from "./api-client-global-error";
export * from "./api-client-form-error";
export * from "./api-client-field-errors";

export type ApiClientError = ApiClientGlobalError | ApiClientFormError;

export const isApiClientError = (e: unknown): e is ApiClientError =>
  isError(e) && [ApiClientFormError, ApiClientGlobalError].some(cls => e instanceof cls);

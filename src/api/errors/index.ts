import { isError } from '~/application/errors';

import { HttpNetworkError, HttpSerializationError } from '~/integrations/http';

import { ApiClientFormError } from './api-client-form-error';
import { ApiClientGlobalError } from './api-client-global-error';

export * from './api-client-field-errors';
export * from './api-client-form-error';
export * from './api-client-global-error';

export type ApiClientError = ApiClientFormError | ApiClientGlobalError;

export const isApiClientError = (e: unknown): e is ApiClientError =>
  isError(e) && [ApiClientFormError, ApiClientGlobalError].some(cls => e instanceof cls);

export type ApiError = ApiClientError | HttpNetworkError | HttpSerializationError;

export const isApiError = (e: unknown): e is ApiClientError =>
  isError(e) &&
  ([HttpNetworkError, HttpSerializationError].some(cls => e instanceof cls) || isApiClientError(e));

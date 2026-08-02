import { type z } from 'zod';

import { ApiClientGlobalErrorCodes } from '../codes';
import {
  type ApiClientFieldErrorsObj,
  type ApiClientFormErrorJson,
  type RawApiClientFieldErrorsObj,
} from '../types';

import {
  AbstractApiClientError,
  type AbstractApiClientErrorConfig,
} from './abstract-api-client-error';
import { ApiClientFieldErrors } from './api-client-field-errors';
import { removeUndefined } from './util';

export interface ApiClientFormErrorConfig<E extends string = string> extends Omit<
  AbstractApiClientErrorConfig,
  'code' | 'status'
> {
  readonly errors: ApiClientFieldErrors<E> | RawApiClientFieldErrorsObj<E>;
}

export class ApiClientFormError<
  E extends string = string,
> extends AbstractApiClientError<ApiClientFormErrorJson> {
  public static fromJson = (json: ApiClientFormErrorJson): ApiClientFormError =>
    new ApiClientFormError({
      errors: json.errors,
    });
  private readonly _errors: ApiClientFieldErrors<E> | RawApiClientFieldErrorsObj<E>;

  constructor({ errors, ...config }: ApiClientFormErrorConfig<E>) {
    super({
      ...config,
      code: ApiClientGlobalErrorCodes.BAD_REQUEST,
      status: ApiClientGlobalErrorCodes.getAttribute(
        ApiClientGlobalErrorCodes.BAD_REQUEST,
        'status',
      ),
    });
    this._errors = errors;
  }

  public static create<Ei extends string>(
    config: ApiClientFormErrorConfig<Ei>,
  ): ApiClientFormError<Ei> {
    return new ApiClientFormError(config);
  }

  public static fromZodError({
    error,
    ...config
  }: {
    readonly error: z.ZodError;
  } & Omit<ApiClientFormErrorConfig, 'errors'>): ApiClientFormError {
    return new ApiClientFormError({
      ...config,
      errors: ApiClientFieldErrors.fromZodError(error),
    });
  }

  public get errors(): ApiClientFieldErrorsObj<E> {
    if (this._errors instanceof ApiClientFieldErrors) {
      return this._errors.errors;
    }
    return new ApiClientFieldErrors(this._errors).errors;
  }

  public get json() {
    return removeUndefined({
      code: this.code,
      errors: this.errors,
      message: this.message,
      status: this.status,
    });
  }
}

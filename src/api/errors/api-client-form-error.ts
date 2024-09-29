import { type z } from "zod";

import { ApiClientGlobalErrorCodes } from "../codes";
import {
  type ApiClientFormErrorJson,
  type ApiClientFieldErrorsObj,
  type RawApiClientFieldErrorsObj,
} from "../types";

import {
  AbstractApiClientError,
  type AbstractApiClientErrorConfig,
} from "./abstract-api-client-error";
import { ApiClientFieldErrors } from "./api-client-field-errors";
import { removeUndefined } from "./util";

export interface ApiClientFormErrorConfig<E extends string = string>
  extends Omit<AbstractApiClientErrorConfig, "status" | "code"> {
  readonly errors: RawApiClientFieldErrorsObj<E> | ApiClientFieldErrors<E>;
}

export class ApiClientFormError<
  E extends string = string,
> extends AbstractApiClientError<ApiClientFormErrorJson> {
  private readonly _errors: RawApiClientFieldErrorsObj<E> | ApiClientFieldErrors<E>;

  constructor({ errors, ...config }: ApiClientFormErrorConfig<E>) {
    super({
      ...config,
      status: ApiClientGlobalErrorCodes.getAttribute(
        ApiClientGlobalErrorCodes.BAD_REQUEST,
        "status",
      ),
      code: ApiClientGlobalErrorCodes.BAD_REQUEST,
    });
    this._errors = errors;
  }

  public get errors(): ApiClientFieldErrorsObj<E> {
    if (this._errors instanceof ApiClientFieldErrors) {
      return this._errors.errors;
    }
    return new ApiClientFieldErrors(this._errors).errors;
  }

  public static create<Ei extends string>(
    config: ApiClientFormErrorConfig<Ei>,
  ): ApiClientFormError<Ei> {
    return new ApiClientFormError(config);
  }

  public static fromZodError({
    error,
    ...config
  }: Omit<ApiClientFormErrorConfig, "errors"> & {
    readonly error: z.ZodError;
  }): ApiClientFormError {
    return new ApiClientFormError({
      ...config,
      errors: ApiClientFieldErrors.fromZodError(error),
    });
  }

  public static fromJson = (json: ApiClientFormErrorJson): ApiClientFormError =>
    new ApiClientFormError({
      errors: json.errors,
    });

  public get json() {
    return removeUndefined({
      errors: this.errors,
      status: this.status as ApiClientFormErrorJson["status"],
      code: this.code,
      message: this.message,
    });
  }
}

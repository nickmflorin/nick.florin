import { NextResponse } from "next/server";

import { type Optional } from "utility-types";
import { type z } from "zod";

import { ApiClientErrorCodes } from "../codes";
import {
  type ApiClientErrorConfig,
  type ApiClientGlobalErrorConfig,
  type ApiClientFormErrorConfig,
  type ApiClientFormErrorJson,
  type ApiClientErrorJson,
  type ApiClientGlobalErrorJson,
  type ApiClientFieldErrorsObj,
  type RawApiClientFieldErrorsObj,
  isZodError,
  type MessageParams,
} from "../types";

import { ApiClientFieldErrors, type IssueLookup } from "./api-client-field-errors";
import { BaseHttpError } from "./http-error";

export type ApiClientErrorResponse = NextResponse<ApiClientErrorJson>;

const removeUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.keys(obj).reduce((prev: T, key: string) => {
    const v = obj[key as keyof T];
    if (v !== undefined) {
      return { ...prev, [key as keyof T]: v } as T;
    }
    return prev;
  }, {} as T);

export abstract class ApiClientError<
  C extends ApiClientErrorConfig = ApiClientErrorConfig,
  J extends ApiClientErrorJson = ApiClientErrorJson,
> extends BaseHttpError<C> {
  constructor(config: Optional<C, "statusCode">) {
    super({
      internalMessage: ApiClientErrorCodes.getAttribute(config.code, "message"),
      ...config,
      statusCode:
        /* The status code and code will only ever be undefined if the ApiClientError is being
           instantiated with an 'errors' array, in which case the code has to be BAD_REQUEST and the
           status code has to be 400. */
        config.statusCode ??
        ApiClientErrorCodes.getAttribute(
          config.code ?? ApiClientErrorCodes.BAD_REQUEST,
          "statusCode",
        ),
    } as C);
  }

  public get code(): C["code"] {
    return this._config.code;
  }

  public get extra(): C["extra"] {
    return this._config.extra;
  }

  public abstract get json(): J;

  public get response(): NextResponse<ApiClientErrorJson> {
    return NextResponse.json<ApiClientErrorJson>(this.json, { status: this.statusCode });
  }
}

export class ApiClientFormError<E extends string = string> extends ApiClientError<
  ApiClientFormErrorConfig<E>,
  ApiClientFormErrorJson
> {
  constructor(config: Omit<ApiClientFormErrorConfig<E>, "statusCode" | "code">) {
    super({
      ...config,
      statusCode: 400 as const,
      code: ApiClientErrorCodes.BAD_REQUEST,
    });
  }

  public get errors(): ApiClientFieldErrorsObj<E> {
    if (this._config.errors instanceof ApiClientFieldErrors) {
      return this._config.errors.errors;
    }
    return new ApiClientFieldErrors(this._config.errors).errors;
  }

  public static reconstruct = (response: ApiClientFormErrorJson) =>
    new ApiClientFormError(response);

  public static BadRequest<E extends string>(
    data: RawApiClientFieldErrorsObj<E> | ApiClientFieldErrors<E>,
  ): ApiClientFormError<E>;

  public static BadRequest<O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    error: z.ZodError,
    schema: O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ): ApiClientFormError<keyof O["shape"] & string>;

  public static BadRequest<
    E extends RawApiClientFieldErrorsObj | ApiClientFieldErrors,
    O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>,
  >(data: E | z.ZodError, schema?: O, lookup?: IssueLookup<keyof O["shape"] & string>) {
    if (data instanceof ApiClientFieldErrors) {
      return new ApiClientFormError({
        errors: data,
      });
    } else if (isZodError(data)) {
      if (schema === undefined) {
        throw new TypeError("Invalid function signature implementation!");
      }
      return this.BadRequest(ApiClientFieldErrors.fromZodError(data, schema, lookup));
    } else {
      return this.BadRequest(new ApiClientFieldErrors(data));
    }
  }

  public get json() {
    return removeUndefined({
      errors: this.errors,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      internalMessage: this.internalMessage,
      extra: this.extra,
    });
  }
}

export class ApiClientGlobalError extends ApiClientError<
  ApiClientGlobalErrorConfig,
  ApiClientGlobalErrorJson
> {
  constructor(config: Optional<ApiClientGlobalErrorConfig, "statusCode">) {
    super(config);
  }

  public static reconstruct = (response: ApiClientGlobalErrorJson) =>
    new ApiClientGlobalError(response);

  public static BadRequest = (message?: string | MessageParams, extra?: Record<string, unknown>) =>
    new ApiClientGlobalError({
      extra,
      code: ApiClientErrorCodes.BAD_REQUEST,
      message: typeof message === "string" ? undefined : message?.public,
      internalMessage: typeof message === "string" ? message : message?.internal,
    });

  public static NotAuthenticated = (
    message?: string | MessageParams,
    extra?: Record<string, unknown>,
  ) =>
    new ApiClientGlobalError({
      code: ApiClientErrorCodes.NOT_AUTHENTICATED,
      extra,
      message: typeof message === "string" ? undefined : message?.public,
      internalMessage: typeof message === "string" ? message : message?.internal,
    });

  public static Forbidden = (message?: string | MessageParams, extra?: Record<string, unknown>) =>
    new ApiClientGlobalError({
      code: ApiClientErrorCodes.FORBIDDEN,
      extra,
      message: typeof message === "string" ? undefined : message?.public,
      internalMessage: typeof message === "string" ? message : message?.internal,
    });

  public static NotFound = (message?: string | MessageParams, extra?: Record<string, unknown>) =>
    new ApiClientGlobalError({
      code: ApiClientErrorCodes.NOT_FOUND,
      extra,
      message: typeof message === "string" ? undefined : message?.public,
      internalMessage: typeof message === "string" ? message : message?.internal,
    });

  public get json() {
    return removeUndefined({
      statusCode: this.statusCode as ApiClientGlobalErrorJson["statusCode"],
      code: this.code,
      message: this.message,
      internalMessage: this.internalMessage,
      extra: this.extra,
    });
  }
}

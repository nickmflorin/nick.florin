import { NextResponse } from "next/server";

import { type Optional } from "utility-types";
import { type z } from "zod";

import { ApiClientErrorCodes } from "../codes";
import {
  processRawApiClientFieldErrors,
  type ApiClientErrorConfig,
  type ApiClientGlobalErrorConfig,
  type ApiClientFormErrorConfig,
  type ApiClientFormErrorJson,
  type ApiClientErrorJson,
  type ApiClientGlobalErrorJson,
  type ApiClientFieldErrors,
  type RawApiClientFieldErrors,
  isZodError,
} from "../types";
import { parseZodError, type IssueLookup } from "../util";

import { BaseHttpError } from "./http-error";

export type ApiClientErrorResponse = NextResponse<ApiClientErrorJson>;

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

  public abstract toJson(): J;

  public toResponse = (): NextResponse<ApiClientErrorJson> =>
    NextResponse.json<ApiClientErrorJson>(this.toJson(), { status: this.statusCode });
}

export class ApiClientFormError<
  C extends ApiClientFormErrorConfig = ApiClientFormErrorConfig,
> extends ApiClientError<C, ApiClientFormErrorJson> {
  constructor(config: Omit<C, "statusCode" | "code">) {
    super({
      ...config,
      statusCode: 400 as const,
      code: ApiClientErrorCodes.BAD_REQUEST,
    } as C);
  }

  public get errors(): C["errors"] {
    return this._config["errors"];
  }

  public static reconstruct = (response: ApiClientFormErrorJson) =>
    new ApiClientFormError(response);

  public static BadRequest<E extends ApiClientFieldErrors | RawApiClientFieldErrors>(
    data: E,
  ): E extends ApiClientFieldErrors
    ? ApiClientFormError<ApiClientFormErrorConfig<keyof E & string>>
    : ApiClientFormError;

  public static BadRequest<O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    error: z.ZodError,
    schema: O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ): ApiClientFormError<ApiClientFormErrorConfig<keyof O["shape"] & string>>;

  public static BadRequest<
    E extends RawApiClientFieldErrors | ApiClientFieldErrors,
    O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>,
  >(data: E | z.ZodError, schema?: O, lookup?: IssueLookup<keyof O["shape"] & string>) {
    if (isZodError(data)) {
      if (schema === undefined) {
        throw new TypeError("Invalid function signature implementation!");
      }
      return this.BadRequest(parseZodError(data, schema, lookup));
    } else {
      const errs = processRawApiClientFieldErrors(data);
      if (errs === null) {
        return null;
      }
      return new ApiClientFormError({
        errors: errs,
      });
    }
  }

  public toJson = () => ({
    errors: this.errors,
    statusCode: this.statusCode,
    code: this.code,
    message: this.message,
    internalMessage: this.internalMessage,
  });
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

  public static BadRequest = (message?: string) =>
    new ApiClientGlobalError({ code: ApiClientErrorCodes.BAD_REQUEST, message });

  public static NotAuthenticated = (message?: string) =>
    new ApiClientGlobalError({ code: ApiClientErrorCodes.NOT_AUTHENTICATED, message });

  public static Forbidden = (message?: string) =>
    new ApiClientGlobalError({ code: ApiClientErrorCodes.FORBIDDEN, message });

  public static NotFound = (message?: string) =>
    new ApiClientGlobalError({ code: ApiClientErrorCodes.NOT_FOUND, message });

  public toJson = () => ({
    statusCode: this.statusCode as ApiClientGlobalErrorJson["statusCode"],
    code: this.code,
    message: this.message,
    internalMessage: this.internalMessage,
  });
}

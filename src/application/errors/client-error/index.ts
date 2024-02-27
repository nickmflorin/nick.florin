import { NextResponse } from "next/server";

import uniqBy from "lodash.uniqby";
import superjson from "superjson";
import { type z } from "zod";

import { BaseHttpError, type BaseHttpErrorConfig } from "../http-error";

import {
  type ApiClientErrorCode,
  ApiClientErrorCodes,
  type ApiClientErrorStatusCode,
  ApiClientFieldErrorCodes,
} from "./codes";
import {
  processRawApiClientFieldErrors,
  type ApiClientErrorResponse,
  type ApiClientFieldErrors,
  type RawApiClientFieldErrors,
  type ApiClientFieldError,
} from "./types";

export * from "./codes";
export * from "./types";

type IssueLookup<L extends string> = { [key in L]?: (issue: z.ZodIssue) => boolean };

const zodErrorToClientResponse = <O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
  error: z.ZodError,
  schema: O,
  lookup?: IssueLookup<keyof O["shape"] & string>,
): ApiClientFieldErrors<keyof O["shape"] & string> => {
  const errs: ApiClientFieldErrors<keyof O["shape"] & string> = {};

  const keys = Object.values(schema.keyof().Values);
  for (const field of keys) {
    const iss: ApiClientFieldError[] = uniqBy(
      error.issues
        .filter(issue => {
          const fn = lookup?.[field];
          return fn !== undefined ? fn(issue) : issue.path[0] === field;
        })
        .map(issue => ({
          code: ApiClientFieldErrorCodes.invalid,
          internalMessage: issue.message,
        })),
      err => err.code,
    );
    if (iss.length !== 0) {
      errs[field as keyof O["shape"] & string] = iss as [
        ApiClientFieldError,
        ...ApiClientFieldError[],
      ];
    }
  }
  return errs;
};

export class ClientError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends BaseHttpError<C> {
  public static reconstruct = (response: Response, message?: string) =>
    new ClientError({
      statusCode: response.status,
      url: response.url,
      message: message ?? response.statusText,
    });
}

type ApiClientErrorGlobalConfig = {
  readonly code: ApiClientErrorCode;
  readonly statusCode?: ApiClientErrorStatusCode;
  readonly message?: string;
  readonly errors?: never;
};

type ApiClientErrorFieldsConfig<M extends RawApiClientFieldErrors = RawApiClientFieldErrors> = {
  readonly code: ApiClientErrorCode;
  readonly statusCode?: ApiClientErrorStatusCode;
  readonly errors: M;
  readonly message?: never;
};

export type ApiClientErrorConfig = ApiClientErrorGlobalConfig | ApiClientErrorFieldsConfig;

type Json<C extends ApiClientErrorConfig> = C extends { errors: ApiClientFieldErrors }
  ? {
      errors: C["errors"];
      statusCode: C["statusCode"];
      code: C["code"];
      message?: never;
    }
  : {
      message: string;
      statusCode: C["statusCode"];
      code: C["code"];
      errors?: never;
    };

type BadRequestRT<M extends string | RawApiClientFieldErrors | ApiClientFieldErrors> =
  M extends string
    ? ApiClientError<ApiClientErrorGlobalConfig>
    : M extends ApiClientFieldErrors
      ? ApiClientError<ApiClientErrorFieldsConfig<M>>
      : M extends RawApiClientFieldErrors
        ? ApiClientError<ApiClientErrorFieldsConfig<M>> | null
        : never;

type Errors<C extends ApiClientErrorConfig> = C extends ApiClientErrorFieldsConfig
  ? ApiClientFieldErrors
  : undefined;

export class ApiClientError<
  C extends ApiClientErrorConfig = ApiClientErrorConfig,
> extends BaseHttpError<C> {
  public readonly code: ApiClientErrorCode;
  public readonly errors: Errors<C>;

  constructor(config: C) {
    super({
      internalMessageDetail: ApiClientErrorCodes.getAttribute(config.code, "message"),
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
    });
    /* The status code and code will only ever be undefined if the ApiClientError is being
       instantiated with an 'errors' array, in which case the code has to be BAD_REQUEST and the
       status code has to be 400. */
    this.code = config.code ?? ApiClientErrorCodes.BAD_REQUEST;

    this.errors = undefined as Errors<C>;
    if (config.errors !== undefined) {
      const errs = processRawApiClientFieldErrors(config.errors);
      if (errs === null) {
        throw new TypeError("The errors object must not be empty to create a BadRequest error.");
      }
      this.errors = errs as Errors<C>;
    }
    this.errors = config.errors as Errors<C>;
  }

  public static reconstruct = (response: ApiClientErrorResponse) => new ApiClientError(response);

  public static BadRequest = <M extends string | RawApiClientFieldErrors | ApiClientFieldErrors>(
    data?: M,
  ): BadRequestRT<M> => {
    if (typeof data === "string" || typeof data === "undefined") {
      return new ApiClientError({
        code: ApiClientErrorCodes.BAD_REQUEST,
        message: data,
      }) as BadRequestRT<M>;
    } else {
      const errs = processRawApiClientFieldErrors(data);
      if (errs === null) {
        return null as BadRequestRT<M>;
      }
      return new ApiClientError({
        errors: data,
        code: ApiClientErrorCodes.BAD_REQUEST,
      }) as BadRequestRT<M>;
    }
  };

  public static ValidationError = <O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    error: z.ZodError,
    schema: O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ) => this.BadRequest(zodErrorToClientResponse(error, schema, lookup));

  public static NotAuthenticated = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.NOT_AUTHENTICATED, message });

  public static Forbidden = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.FORBIDDEN, message });

  public static NotFound = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.NOT_FOUND, message });

  public toJson = (): Json<C> =>
    ({
      errors: this.errors,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
    }) as Json<C>;

  public toSerializedJson = () => superjson.serialize(this.toJson());

  public toResponse = () => NextResponse.json(this.toSerializedJson(), { status: this.statusCode });
}

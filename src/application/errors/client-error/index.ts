import { NextResponse } from "next/server";

import superjson from "superjson";

import { BaseHttpError, type BaseHttpErrorConfig } from "../http-error";

import {
  type ApiClientErrorCode,
  ApiClientErrorCodes,
  type ApiClientErrorStatusCode,
} from "./codes";
import { type ApiClientErrorResponse, type ApiClientFieldError } from "./types";

export * from "./codes";
export * from "./types";

export class ClientError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends BaseHttpError<C> {
  protected readonly defaultMessage = "There was an error with the request.";

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

type ApiClientErrorFieldsConfig = {
  readonly errors: ApiClientFieldError[];
  readonly code?: typeof ApiClientErrorCodes.BAD_REQUEST;
  readonly statusCode?: 400;
  readonly message?: never;
};

export type ApiClientErrorConfig = ApiClientErrorGlobalConfig | ApiClientErrorFieldsConfig;

type Json<C extends ApiClientErrorConfig> = C extends { errors: ApiClientFieldError[] }
  ? {
      errors: Errors<C>;
      statusCode: 400;
      code: typeof ApiClientErrorCodes.BAD_REQUEST;
    }
  : {
      statusCode: NonNullable<C["statusCode"]>;
      code: NonNullable<C["code"]>;
      message: string;
    };

type BadRequestRT<M extends string | ApiClientFieldError | ApiClientFieldError[]> = M extends string
  ? ApiClientError<ApiClientErrorGlobalConfig>
  : ApiClientError<ApiClientErrorFieldsConfig>;

type Errors<C extends ApiClientErrorConfig> = C extends ApiClientErrorFieldsConfig
  ? ApiClientFieldError[]
  : undefined;

export class ApiClientError<C extends ApiClientErrorConfig> extends BaseHttpError<{
  statusCode: NonNullable<C["statusCode"]>;
  message?: string;
  code: NonNullable<C["code"]>;
}> {
  public readonly code: NonNullable<C["code"]>;
  protected readonly defaultMessage = "There was an error with the request.";
  public readonly errors: Errors<C>;

  constructor({ message, code, errors, statusCode }: ApiClientErrorConfig) {
    super({
      message,
      statusCode:
        /* The status code and code will only ever be undefined if the ApiClientError is being
           instantiated with an 'errors' array, in which case the code has to be BAD_REQUEST and the
           status code has to be 400. */
        statusCode ??
        ApiClientErrorCodes.getAttribute(code ?? ApiClientErrorCodes.BAD_REQUEST, "statusCode"),
    });
    /* The status code and code will only ever be undefined if the ApiClientError is being
       instantiated with an 'errors' array, in which case the code has to be BAD_REQUEST and the
       status code has to be 400. */
    this.code = code ?? ApiClientErrorCodes.BAD_REQUEST;
    this.errors = errors as Errors<C>;
  }

  public get message() {
    if (this._message) {
      return this._message;
    }
    return ApiClientErrorCodes.getAttribute(this.code, "message");
  }

  public static reconstruct = (response: ApiClientErrorResponse) => new ApiClientError(response);

  public static BadRequest = <M extends string | ApiClientFieldError | ApiClientFieldError[]>(
    data?: M,
  ): BadRequestRT<M> => {
    if (typeof data === "string" || typeof data === "undefined") {
      return new ApiClientError({
        code: ApiClientErrorCodes.BAD_REQUEST,
        message: data,
      }) as BadRequestRT<M>;
    } else if (Array.isArray(data)) {
      return new ApiClientError({
        errors: data,
        code: ApiClientErrorCodes.BAD_REQUEST,
      }) as BadRequestRT<M>;
    } else {
      return new ApiClientError({ errors: [data] }) as BadRequestRT<M>;
    }
  };

  public static NotAuthenticated = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.NOT_AUTHENTICATED, message });

  public static Forbidden = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.FORBIDDEN, message });

  public static NotFound = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.NOT_FOUND, message });

  public toJson = (): Json<C> =>
    this.errors !== undefined
      ? ({
          code: this.code as typeof ApiClientErrorCodes.BAD_REQUEST,
          statusCode: this.statusCode as 400,
          errors: this.errors,
        } as Json<C>)
      : ({
          code: this.code,
          statusCode: this.statusCode,
          message: this.message,
        } as Json<C>);

  public toSerializedJson = () => superjson.serialize(this.toJson());

  public toResponse = () => NextResponse.json(this.toSerializedJson(), { status: this.statusCode });
}

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

type ConfigStatusCode<M extends ApiClientFieldErrors | string> = M extends string
  ? ApiClientErrorStatusCode
  : 400;

type ConfigCode<M extends ApiClientFieldErrors | string> = M extends string
  ? ApiClientErrorCode
  : typeof ApiClientErrorCodes.BAD_REQUEST;

type ApiClientErrorConfig<M extends ApiClientFieldErrors | string> = {
  readonly message?: M;
  readonly internalMessage?: string;
  readonly code: ConfigCode<M>;
  readonly statusCode?: ConfigStatusCode<M>;
};

type Json<M extends ApiClientFieldErrors | string> = {
  errors?: Errors<M>;
  statusCode: ConfigStatusCode<M>;
  code: ConfigCode<M>;
  message: string;
  internalMessage: string;
};

type Errors<M extends ApiClientFieldErrors | string> = M extends string
  ? undefined
  : M extends ApiClientFieldErrors
    ? M
    : never;

const isZodError = (
  data: string | RawApiClientFieldErrors | ApiClientFieldErrors | z.ZodError,
): data is z.ZodError => typeof data !== "string" && (data as z.ZodError).issues !== undefined;

export class ApiClientError<
  M extends ApiClientFieldErrors | string = ApiClientFieldErrors | string,
> extends BaseHttpError<
  ApiClientErrorConfig<M> & { readonly message?: string; internalMessageDetail?: string }
> {
  public readonly code: ConfigCode<M>;
  public readonly errors: Errors<M>;

  constructor({ message, ...config }: ApiClientErrorConfig<M>) {
    super({
      internalMessageDetail: ApiClientErrorCodes.getAttribute(config.code, "message"),
      ...config,
      message: typeof message === "string" ? message : undefined,
      statusCode:
        /* The status code and code will only ever be undefined if the ApiClientError is being
           instantiated with an 'errors' array, in which case the code has to be BAD_REQUEST and the
           status code has to be 400. */
        config.statusCode ??
        (ApiClientErrorCodes.getAttribute(
          config.code ?? ApiClientErrorCodes.BAD_REQUEST,
          "statusCode",
        ) as ConfigStatusCode<M>),
    });
    this.code = config.code;

    this.errors = undefined as Errors<M>;
    if (typeof message !== "string") {
      this.errors = message as Errors<M>;
    }
  }

  public static reconstruct = (response: ApiClientErrorResponse) => new ApiClientError(response);

  public static BadRequest<M extends string>(message: M): ApiClientError<M>;
  public static BadRequest<M extends ApiClientFieldErrors | RawApiClientFieldErrors>(
    message: M,
  ): M extends ApiClientFieldErrors
    ? ApiClientError<M>
    : ApiClientError<ApiClientFieldErrors> | null;
  public static BadRequest<O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    error: z.ZodError,
    schema: O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ): ApiClientError<ApiClientFieldErrors<keyof O["shape"] & string>>;
  public static BadRequest<
    M extends string | RawApiClientFieldErrors | ApiClientFieldErrors,
    O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>,
  >(message: M | z.ZodError, schema?: O, lookup?: IssueLookup<keyof O["shape"] & string>) {
    if (typeof message === "string") {
      return new ApiClientError({
        message,
        code: ApiClientErrorCodes.BAD_REQUEST,
        statusCode: 400,
      });
    } else if (isZodError(message)) {
      if (schema === undefined) {
        throw new TypeError("Invalid function signature implementation!");
      }
      return this.BadRequest(zodErrorToClientResponse(message, schema, lookup));
    } else {
      const errs = processRawApiClientFieldErrors(message);
      if (errs === null) {
        return null;
      }
      return new ApiClientError({
        message: errs,
        code: ApiClientErrorCodes.BAD_REQUEST,
        statusCode: 400,
      });
    }
  }

  public static NotAuthenticated = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.NOT_AUTHENTICATED, message });

  public static Forbidden = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.FORBIDDEN, message });

  public static NotFound = (message?: string) =>
    new ApiClientError({ code: ApiClientErrorCodes.NOT_FOUND, message });

  public toJson = (): Json<M> =>
    ({
      errors: this.errors,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      internalMessage: this.internalMessage,
    }) as Json<M>;

  public toSerializedJson = () => superjson.serialize(this.toJson());

  public toResponse = () => NextResponse.json(this.toSerializedJson(), { status: this.statusCode });
}

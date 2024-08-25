import {
  type EnumeratedLiteralsMember,
  type EnumeratedLiteralsModel,
  enumeratedLiterals,
} from "enumerated-literals";
import { type Optional } from "utility-types";
import { z } from "zod";

import {
  type ApiClientErrorCode,
  ApiClientErrorCodes,
  type ApiClientErrorStatusCode,
  type ApiClientFieldErrorCode,
} from "./codes";
import { type ApiClientFieldErrors } from "./errors/api-client-field-errors";

export type MessageParams = {
  readonly internal?: string;
  readonly public?: string;
};

export const ClientSuccessCodes = enumeratedLiterals(
  [{ value: "HTTP_200_OK", statusCode: 200 }] as const,
  {},
);
export type ClientSuccessCode = EnumeratedLiteralsMember<typeof ClientSuccessCodes>;
export type ClientSuccessStatusCode<C extends ClientSuccessCode = ClientSuccessCode> = Extract<
  EnumeratedLiteralsModel<typeof ClientSuccessCodes>,
  { value: C }
>["statusCode"];

export type ClientSuccessResponseBody<T> = { data: T };

export type ApiClientFieldError = {
  readonly message: string;
  readonly internalMessage: string;
  readonly code: ApiClientFieldErrorCode;
};

export type RawApiClientFieldErrorObj = Optional<
  ApiClientFieldError,
  "message" | "internalMessage"
> & {
  readonly conditional?: boolean;
};

export type RawApiClientFieldError<O = RawApiClientFieldErrorObj> =
  | O
  | ApiClientFieldErrorCode
  | null
  | undefined;

export type RawApiClientFieldErrorsObj<F extends string = string> = Partial<{
  [key in F]: RawApiClientFieldError | RawApiClientFieldError[];
}>;

export type ApiClientFieldErrorsObj<E extends string = string> = Partial<{
  [key in E & string]: ApiClientFieldError | [ApiClientFieldError, ...ApiClientFieldError[]];
}>;

export const isZodError = (
  data: string | RawApiClientFieldErrorsObj | ApiClientFieldErrorsObj | z.ZodError,
): data is z.ZodError => typeof data !== "string" && (data as z.ZodError).issues !== undefined;

export type ApiClientErrorConfig<
  S extends ApiClientErrorStatusCode = ApiClientErrorStatusCode,
  C extends ApiClientErrorCode = ApiClientErrorCode,
> = {
  readonly internalMessage?: string;
  readonly code: C;
  readonly statusCode: S;
  readonly extra?: Record<string, unknown>;
};

type ApiClientErrorJsonStatusCode<C extends ApiClientErrorConfig> = C extends {
  readonly statusCode: infer S extends ApiClientErrorStatusCode;
}
  ? S
  : ApiClientErrorStatusCode<C["code"]>;

export type ApiClientErrorBaseJson<C extends ApiClientErrorConfig = ApiClientErrorConfig> = {
  readonly code: C["code"];
  readonly statusCode: ApiClientErrorJsonStatusCode<C>;
  readonly internalMessage: string;
  readonly extra?: Record<string, unknown>;
};

export type ApiClientGlobalErrorConfig = ApiClientErrorConfig & {
  readonly message?: string;
};

export interface ApiClientGlobalErrorJson<
  C extends ApiClientGlobalErrorConfig = ApiClientGlobalErrorConfig,
> extends ApiClientErrorBaseJson<C> {
  readonly message: string;
}

const ApiClientGlobalErrorJsonSchema = z.object({
  code: z.union([
    z.literal(ApiClientErrorCodes.BAD_REQUEST),
    z.literal(ApiClientErrorCodes.NOT_AUTHENTICATED),
    z.literal(ApiClientErrorCodes.FORBIDDEN),
    z.literal(ApiClientErrorCodes.NOT_FOUND),
  ]),
  statusCode: z.number().int(),
  internalMessage: z.string(),
  message: z.string(),
  extra: z.any().optional(),
});

export const isApiClientGlobalErrorJson = (
  response: unknown,
): response is ApiClientGlobalErrorJson =>
  ApiClientGlobalErrorJsonSchema.safeParse(response).success;

export interface ApiClientFormErrorConfig<E extends string = string>
  extends ApiClientErrorConfig<400, typeof ApiClientErrorCodes.BAD_REQUEST> {
  readonly errors: RawApiClientFieldErrorsObj<E> | ApiClientFieldErrors<E>;
}

export interface ApiClientFormErrorJson<E extends string = string>
  extends ApiClientErrorBaseJson<ApiClientFormErrorConfig<E>> {
  readonly errors: ApiClientFieldErrorsObj<E>;
}

const ApiClientFormErrorJsonSchema = z.object({
  code: z.literal(ApiClientErrorCodes.BAD_REQUEST),
  statusCode: z.literal(400),
  internalMessage: z.string(),
  errors: z.any(),
  extra: z.any().optional(),
});

export type ApiClientErrorJson<
  E extends string = string,
  C extends ApiClientGlobalErrorConfig = ApiClientGlobalErrorConfig,
> = ApiClientFormErrorJson<E> | ApiClientGlobalErrorJson<C>;

export const isApiClientFormErrorJson = <T, E extends string = string>(
  response: T | ApiClientErrorJson<E> | ApiClientGlobalErrorJson,
): response is ApiClientFormErrorJson<E> =>
  ApiClientFormErrorJsonSchema.safeParse(response).success;

export const isApiClientErrorJson = (response: unknown): response is ApiClientErrorJson =>
  isApiClientFormErrorJson(response) || isApiClientGlobalErrorJson(response);

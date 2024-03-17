import { z } from "zod";

import {
  type EnumeratedLiteralsType,
  type EnumeratedLiteralsModel,
  enumeratedLiterals,
} from "~/lib/literals";

import {
  type ApiClientErrorCode,
  ApiClientErrorCodes,
  type ApiClientErrorStatusCode,
  type ApiClientFieldErrorCode,
} from "./codes";

export const ClientSuccessCodes = enumeratedLiterals(
  [{ value: "HTTP_200_OK", statusCode: 200 }] as const,
  {},
);
export type ClientSuccessCode = EnumeratedLiteralsType<typeof ClientSuccessCodes>;
export type ClientSuccessStatusCode<C extends ClientSuccessCode = ClientSuccessCode> = Extract<
  EnumeratedLiteralsModel<typeof ClientSuccessCodes>,
  { value: C }
>["statusCode"];

export type ClientSuccessResponseBody<T> = { data: T };

export type ApiClientFieldError = {
  readonly message?: string;
  readonly internalMessage?: string;
  readonly code: ApiClientFieldErrorCode;
};

export type RawApiClientFieldError = ApiClientFieldError & {
  readonly conditional?: boolean;
};

export type RawApiClientFieldErrors<F extends string = string> = Partial<{
  [key in F]:
    | (RawApiClientFieldError | null | undefined)[]
    | null
    | undefined
    | RawApiClientFieldError;
}>;

export type ApiClientFieldErrors<E extends string = string> = Partial<{
  [key in E & string]: ApiClientFieldError | [ApiClientFieldError, ...ApiClientFieldError[]];
}>;

export const processRawApiClientFieldErrors = <F extends string>(
  data: RawApiClientFieldErrors<F>,
): ApiClientFieldErrors<F> | null => {
  const errs = Object.keys(data).reduce(
    (acc: ApiClientFieldErrors<F>, key: string): ApiClientFieldErrors<F> => {
      const fieldErrors = data[key as F];
      if (fieldErrors !== undefined && fieldErrors !== null) {
        const fieldErrorsArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
        const filtered = fieldErrorsArray.filter(err => {
          if (err !== undefined && err !== null) {
            if (err.conditional !== undefined) {
              return err.conditional;
            }
            return true;
          }
          return false;
        });
        if (filtered.length !== 0) {
          return { ...acc, [key]: filtered as [ApiClientFieldError, ...ApiClientFieldError[]] };
        }
      }
      return acc;
    },
    {} as ApiClientFieldErrors<F>,
  );
  return Object.keys(errs).length === 0 ? null : errs;
};

export const isZodError = (
  data: string | RawApiClientFieldErrors | ApiClientFieldErrors | z.ZodError,
): data is z.ZodError => typeof data !== "string" && (data as z.ZodError).issues !== undefined;

export type ApiClientErrorConfig<
  S extends ApiClientErrorStatusCode = ApiClientErrorStatusCode,
  C extends ApiClientErrorCode = ApiClientErrorCode,
> = {
  readonly internalMessage?: string;
  readonly code: C;
  readonly statusCode: S;
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
  code: ApiClientErrorCodes.schema,
  // It's not worth making this a literal type because it can easily lead to mishandling of errors.
  statusCode: z.number().int(),
  internalMessage: z.string(),
  message: z.string(),
});

export const isApiClientGlobalErrorJson = (
  response: unknown,
): response is ApiClientGlobalErrorJson =>
  ApiClientGlobalErrorJsonSchema.safeParse(response).success;

export interface ApiClientFormErrorConfig<E extends string = string>
  extends ApiClientErrorConfig<400, typeof ApiClientErrorCodes.BAD_REQUEST> {
  readonly errors: ApiClientFieldErrors<E>;
}

export interface ApiClientFormErrorJson<E extends string = string>
  extends ApiClientErrorBaseJson<ApiClientFormErrorConfig<E>> {
  readonly errors: ApiClientFieldErrors<E>;
}

const ApiClientFormErrorJsonSchema = z.object({
  code: z.literal(ApiClientErrorCodes.BAD_REQUEST),
  statusCode: z.literal(400),
  internalMessage: z.string(),
  errors: z.any(),
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

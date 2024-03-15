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

export type ApiClientFieldErrors<F extends string = string> = Partial<{
  [key in F]: ApiClientFieldError | [ApiClientFieldError, ...ApiClientFieldError[]];
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

export type ApiClientFieldErrorsResponse<F extends string = string> = {
  readonly code: typeof ApiClientErrorCodes.BAD_REQUEST;
  readonly statusCode: 400;
  readonly errors: ApiClientFieldErrors<F>;
};

const ApiClientFieldErrorsResponseSchema = z.object({
  code: z.literal(ApiClientErrorCodes.BAD_REQUEST),
  statusCode: z.literal(400),
  internalMessage: z.string().optional(),
  message: z.string(),
  errors: z.any(),
});

export const isApiClientFieldErrorsResponse = (
  response: unknown,
): response is ApiClientFieldErrorsResponse =>
  ApiClientFieldErrorsResponseSchema.safeParse(response).success;

export type ApiClientGlobalError = {
  readonly code: ApiClientErrorCode;
  readonly statusCode: ApiClientErrorStatusCode;
  readonly message: string;
  readonly internalMessage?: string;
};

const ApiClientGlobalErrorSchema = z.object({
  code: ApiClientErrorCodes.schema,
  statusCode: z.enum(
    [...ApiClientErrorCodes.getAttributes("statusCode")].map(s => String(s)) as [
      string,
      ...string[],
    ],
  ),
  message: z.string(),
  internalMessage: z.string().optional(),
});

export const isApiClientGlobalErrorResponse = (
  response: unknown,
): response is ApiClientGlobalError => ApiClientGlobalErrorSchema.safeParse(response).success;

export type ApiClientErrorResponse = ApiClientGlobalError | ApiClientFieldErrorsResponse;

export const isApiClientErrorResponse = (response: unknown): response is ApiClientErrorResponse =>
  isApiClientFieldErrorsResponse(response) || isApiClientGlobalErrorResponse(response);

export const isZodError = (
  data: string | RawApiClientFieldErrors | ApiClientFieldErrors | z.ZodError,
): data is z.ZodError => typeof data !== "string" && (data as z.ZodError).issues !== undefined;

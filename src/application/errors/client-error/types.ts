import { z } from "zod";

import {
  type ApiClientErrorCode,
  ApiClientErrorCodes,
  type ApiClientErrorStatusCode,
  type ApiClientFieldErrorCode,
  ApiClientFieldErrorCodes,
} from "./codes";

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
  [key in F]: [ApiClientFieldError, ...ApiClientFieldError[]];
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
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string().optional(),
      internalMessage: z.string().optional(),
      code: ApiClientFieldErrorCodes.schema,
    }),
  ),
});

export const isApiClientFieldErrorsResponse = (
  response: unknown,
): response is ApiClientFieldErrorsResponse =>
  ApiClientFieldErrorsResponseSchema.safeParse(response).success;

export type ApiClientGlobalError = {
  readonly code: ApiClientErrorCode;
  readonly statusCode: ApiClientErrorStatusCode;
  readonly message: string;
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
});

export const isApiClientGlobalErrorResponse = (
  response: unknown,
): response is ApiClientGlobalError => ApiClientGlobalErrorSchema.safeParse(response).success;

export type ApiClientErrorResponse = ApiClientGlobalError | ApiClientFieldErrorsResponse;

export const isApiClientErrorResponse = (response: unknown): response is ApiClientErrorResponse =>
  isApiClientFieldErrorsResponse(response) || isApiClientGlobalErrorResponse(response);

import { z } from "zod";

import {
  type ApiClientErrorCode,
  ApiClientErrorCodes,
  type ApiClientErrorStatusCode,
  type ApiClientFieldErrorCode,
  ApiClientFieldErrorCodes,
} from "./codes";

export type ApiClientFieldError = {
  readonly field: string;
  readonly message?: string;
  readonly code: ApiClientFieldErrorCode;
};

export type ApiClientFieldErrors = {
  readonly code: typeof ApiClientErrorCodes.BAD_REQUEST;
  readonly statusCode: 400;
  readonly errors: [ApiClientFieldError, ...ApiClientFieldError[]];
};

const ApiClientFieldErrorsSchema = z.object({
  code: z.literal(ApiClientErrorCodes.BAD_REQUEST),
  statusCode: z.literal(400),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string().optional(),
      code: ApiClientFieldErrorCodes.schema,
    }),
  ),
});

export const isApiClientFieldErrorsResponse = (
  response: unknown,
): response is ApiClientFieldErrors => ApiClientFieldErrorsSchema.safeParse(response).success;

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

export type ApiClientErrorResponse = ApiClientGlobalError | ApiClientFieldErrors;

export const isApiClientErrorResponse = (response: unknown): response is ApiClientErrorResponse =>
  isApiClientFieldErrorsResponse(response) || isApiClientGlobalErrorResponse(response);

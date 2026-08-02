import { type Optional } from 'utility-types';
import { z } from 'zod';

import {
  type ApiClientFieldErrorCode,
  type ApiClientGlobalErrorCode,
  ApiClientGlobalErrorCodes,
} from './codes';

export type ApiClientFieldError = {
  readonly code: ApiClientFieldErrorCode;
  readonly internalMessage: string;
  readonly message: string;
};

export type RawApiClientFieldErrorObj = {
  readonly conditional?: boolean;
} & Optional<ApiClientFieldError, 'internalMessage' | 'message'>;

export type RawApiClientFieldError<O = RawApiClientFieldErrorObj> =
  ApiClientFieldErrorCode | null | O | undefined;

export type RawApiClientFieldErrorsObj<F extends string = string> = Partial<
  Record<F, RawApiClientFieldError | RawApiClientFieldError[]>
>;

export type ApiClientFieldErrorsObj<E extends string = string> = Partial<
  Record<E & string, [ApiClientFieldError, ...ApiClientFieldError[]] | ApiClientFieldError>
>;

export const isZodError = (
  data: ApiClientFieldErrorsObj | RawApiClientFieldErrorsObj | string | z.ZodError,
): data is z.ZodError => typeof data !== 'string' && 'issues' in data;

export type ApiClientErrorBaseJson = {
  readonly code: ApiClientGlobalErrorCode;
  readonly message: string;
  readonly status: number;
};

export type ApiClientGlobalErrorJson = ApiClientErrorBaseJson;

const ApiClientGlobalErrorJsonSchema = z.object({
  code: z.union([
    z.literal(ApiClientGlobalErrorCodes.BAD_REQUEST),
    z.literal(ApiClientGlobalErrorCodes.NOT_AUTHENTICATED),
    z.literal(ApiClientGlobalErrorCodes.FORBIDDEN),
    z.literal(ApiClientGlobalErrorCodes.NOT_FOUND),
  ]),
  message: z.string(),
  status: z.number().int(),
});

export const isApiClientGlobalErrorJson = (
  response: unknown,
): response is ApiClientGlobalErrorJson =>
  ApiClientGlobalErrorJsonSchema.safeParse(response).success;

export type ApiClientFormErrorJson<E extends string = string> = {
  readonly errors: ApiClientFieldErrorsObj<E>;
} & ApiClientErrorBaseJson;

const ApiClientFormErrorJsonSchema = z.object({
  code: z.literal(ApiClientGlobalErrorCodes.BAD_REQUEST),
  errors: z.any(),
  message: z.string(),
  status: z.literal(400),
});

export type ApiClientErrorJson<E extends string = string> =
  ApiClientFormErrorJson<E> | ApiClientGlobalErrorJson;

export const isApiClientFormErrorJson = <T, E extends string = string>(
  response: ApiClientErrorJson<E> | ApiClientGlobalErrorJson | T,
): response is ApiClientFormErrorJson<E> =>
  ApiClientFormErrorJsonSchema.safeParse(response).success;

export const isApiClientErrorJson = (response: unknown): response is ApiClientErrorJson =>
  isApiClientFormErrorJson(response) || isApiClientGlobalErrorJson(response);

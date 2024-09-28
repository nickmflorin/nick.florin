import { type Optional } from "utility-types";
import { z } from "zod";

import {
  type ApiClientGlobalErrorCode,
  ApiClientGlobalErrorCodes,
  type ApiClientFieldErrorCode,
} from "./codes";

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

export type ApiClientErrorBaseJson = {
  readonly code: ApiClientGlobalErrorCode;
  readonly status: number;
  readonly message: string;
};

export type ApiClientGlobalErrorJson = ApiClientErrorBaseJson;

const ApiClientGlobalErrorJsonSchema = z.object({
  code: z.union([
    z.literal(ApiClientGlobalErrorCodes.BAD_REQUEST),
    z.literal(ApiClientGlobalErrorCodes.NOT_AUTHENTICATED),
    z.literal(ApiClientGlobalErrorCodes.FORBIDDEN),
    z.literal(ApiClientGlobalErrorCodes.NOT_FOUND),
  ]),
  status: z.number().int(),
  message: z.string(),
});

export const isApiClientGlobalErrorJson = (
  response: unknown,
): response is ApiClientGlobalErrorJson =>
  ApiClientGlobalErrorJsonSchema.safeParse(response).success;

export type ApiClientFormErrorJson<E extends string = string> = ApiClientErrorBaseJson & {
  readonly errors: ApiClientFieldErrorsObj<E>;
};

const ApiClientFormErrorJsonSchema = z.object({
  code: z.literal(ApiClientGlobalErrorCodes.BAD_REQUEST),
  status: z.literal(400),
  message: z.string(),
  // TODO: We might want to make this more strict...
  errors: z.any(),
});

export type ApiClientErrorJson<E extends string = string> =
  | ApiClientFormErrorJson<E>
  | ApiClientGlobalErrorJson;

export const isApiClientFormErrorJson = <T, E extends string = string>(
  response: T | ApiClientErrorJson<E> | ApiClientGlobalErrorJson,
): response is ApiClientFormErrorJson<E> =>
  ApiClientFormErrorJsonSchema.safeParse(response).success;

export const isApiClientErrorJson = (response: unknown): response is ApiClientErrorJson =>
  isApiClientFormErrorJson(response) || isApiClientGlobalErrorJson(response);

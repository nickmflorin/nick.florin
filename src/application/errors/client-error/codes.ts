import {
  type EnumeratedLiteralsType,
  type EnumeratedLiteralsModel,
  enumeratedLiterals,
} from "~/lib/literals";

export const ApiClientErrorCodes = enumeratedLiterals(
  [
    {
      value: "NOT_AUTHENTICATED",
      statusCode: 403,
      message: "You must be authenticated to perform this action.",
    },
    {
      value: "NOT_FOUND",
      statusCode: 404,
      message: "The requested resource could not be found.",
    },
    { value: "BAD_REQUEST", statusCode: 400, message: "Bad request." },
    {
      value: "FORBIDDEN",
      statusCode: 401,
      message: "You do not have permission to perform this action.",
    },
  ] as const,
  {},
);

export type ApiClientErrorCode = EnumeratedLiteralsType<typeof ApiClientErrorCodes>;

export type ApiClientErrorStatusCode<C extends ApiClientErrorCode = ApiClientErrorCode> = Extract<
  EnumeratedLiteralsModel<typeof ApiClientErrorCodes>,
  { value: C }
>["statusCode"];

export const ApiClientFieldErrorCodes = enumeratedLiterals(
  [
    {
      value: "unique",
      message: (field: string) => `The field ${field} must be unique.`,
    },
    {
      value: "invalid",
      message: (field: string) => `The field ${field} is invalid.`,
    },
  ] as const,
  {},
);

export type ApiClientFieldErrorCode = EnumeratedLiteralsType<typeof ApiClientFieldErrorCodes>;

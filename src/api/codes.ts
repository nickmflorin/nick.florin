import {
  type EnumeratedLiteralsMember,
  type EnumeratedLiteralsModel,
  enumeratedLiterals,
} from "enumerated-literals";

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

export type ApiClientErrorCode = EnumeratedLiteralsMember<typeof ApiClientErrorCodes>;

export type ApiClientErrorStatusCode<C extends ApiClientErrorCode = ApiClientErrorCode> = Extract<
  EnumeratedLiteralsModel<typeof ApiClientErrorCodes>,
  { value: C }
>["statusCode"];

export const ApiClientFieldErrorCodes = enumeratedLiterals(
  [
    {
      value: "unique",
      message: (field: string) => `The field ${field} must be unique.`,
      internalMessage: (field: string) => `The field ${field} must be unique.`,
    },
    {
      value: "invalid",
      message: (field: string) => `The field ${field} is invalid.`,
      internalMessage: (field: string) => `The field ${field} is invalid.`,
    },
    {
      value: "does_not_exist",
      /* This message is user facing, so we do not want to give specific information about why the
         field is invalid - just that it is invalid. */
      message: (field: string) => `The field ${field} is invalid.`,
      internalMessage: (field: string) => `The field ${field} is invalid.`,
    },
  ] as const,
  {},
);

export type ApiClientFieldErrorCode = EnumeratedLiteralsMember<typeof ApiClientFieldErrorCodes>;

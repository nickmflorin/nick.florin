import { type EnumeratedLiteralsMember, enumeratedLiterals } from "enumerated-literals";

export const ApiClientGlobalErrorCodes = enumeratedLiterals(
  [
    {
      value: "NOT_AUTHENTICATED",
      status: 401,
      message: "You must be authenticated to perform this action.",
    },
    {
      value: "NOT_FOUND",
      status: 404,
      message: "The requested resource could not be found.",
    },
    { value: "BAD_REQUEST", status: 400, message: "Bad request." },
    {
      value: "FORBIDDEN",
      status: 403,
      message: "You do not have permission to perform this action.",
    },
    {
      value: "INTERNAL_SERVER",
      status: 500,
      message: "There was an internal server error.",
    },
    {
      value: "UNKNOWN",
      status: null,
      message: "There was an unknown error.",
    },
  ] as const,
  {},
);

export type ApiClientGlobalErrorCode = EnumeratedLiteralsMember<typeof ApiClientGlobalErrorCodes>;

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

import {
  type EnumeratedLiteralsType,
  type EnumeratedLiteralsModel,
  enumeratedLiterals,
} from "~/lib/literals";

export const ClientErrorCodes = enumeratedLiterals(
  [
    {
      value: "NOT_AUTHENTICATED",
      statusCode: 403,
      message: "You must be authenticated to perform this action.",
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

export type ClientErrorCode = EnumeratedLiteralsType<typeof ClientErrorCodes>;
export type ClientErrorStatusCode<C extends ClientErrorCode = ClientErrorCode> = Extract<
  EnumeratedLiteralsModel<typeof ClientErrorCodes>,
  { value: C }
>["statusCode"];

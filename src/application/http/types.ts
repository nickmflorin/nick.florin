import {
  type EnumeratedLiteralsType,
  type EnumeratedLiteralsModel,
  enumeratedLiterals,
} from "~/lib/literals";

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

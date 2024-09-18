import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

export type JsonValue =
  | JsonObject
  | JsonObject[]
  | JsonValue[]
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | null;

export type JsonObject = Partial<{
  [k: string]: JsonValue;
}>;

export const HttpMethods = enumeratedLiterals(["GET", "POST", "PATCH", "DELETE"] as const, {});
export type HttpMethod = EnumeratedLiteralsMember<typeof HttpMethods>;

export enum STATUS_CODES {
  HTTP_200_OK = 200,
  HTTP_201_OK = 201,
  HTTP_204_OK = 204,
  HTTP_400_BAD_REQUEST = 400,
  HTTP_401_UNAUTHORIZED = 401,
  HTTP_403_FORBIDDEN = 403,
  HTTP_404_NOT_FOUND = 404,
  HTTP_405_METHOD_NOT_ALLOWED = 405,
  HTTP_500_INTERNAL_SERVER_ERROR = 500,
}

export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

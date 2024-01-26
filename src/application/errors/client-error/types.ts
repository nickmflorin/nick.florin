import { z } from "zod";

import { type ClientErrorCode, ClientErrorCodes, type ClientErrorStatusCode } from "./codes";

const ClientErrorResponseBodySchema = z.object({
  code: ClientErrorCodes.schema,
  statusCode: z.enum(
    [...ClientErrorCodes.getAttributes("statusCode")].map(s => String(s)) as [string, ...string[]],
  ),
  message: z.string(),
});

export const isClientErrorResponseBody = (response: unknown): response is ClientErrorResponseBody =>
  ClientErrorResponseBodySchema.safeParse(response).success;

export type ClientErrorResponseBody = {
  readonly code: ClientErrorCode;
  readonly statusCode: ClientErrorStatusCode;
  readonly message: string;
};

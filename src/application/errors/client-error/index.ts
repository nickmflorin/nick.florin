import { NextResponse } from "next/server";

import superjson from "superjson";

import { BaseHttpError } from "../http-error";

import { type ClientErrorCode, ClientErrorCodes, type ClientErrorStatusCode } from "./codes";
import { type ClientErrorResponseBody } from "./types";

export * from "./codes";
export * from "./types";

export type ClientErrorConfig = {
  readonly code: ClientErrorCode;
  readonly statusCode?: ClientErrorStatusCode;
  readonly message?: string;
  readonly url?: string;
};

export class ClientError extends BaseHttpError {
  private readonly config: Pick<ClientErrorConfig, "code" | "statusCode">;

  constructor({ message, url, ...config }: ClientErrorConfig) {
    super({ message, url });
    this.config = config;
  }

  public get code() {
    return this.config.code;
  }

  public get statusCode() {
    return this.config.statusCode || ClientErrorCodes.getAttribute(this.code, "statusCode");
  }

  public get message() {
    if (this._message) {
      return this._message;
    }
    return ClientErrorCodes.getAttribute(this.code, "message");
  }

  public static reconstruct = (json: ClientErrorResponseBody) => new ClientError(json);

  public static BadRequest = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.BAD_REQUEST, message });

  public static NotAuthenticated = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.NOT_AUTHENTICATED, message });

  public static Forbidden = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.FORBIDDEN, message });

  public toJson = (): ClientErrorResponseBody => ({
    code: this.code,
    statusCode: this.statusCode,
    message: this.message,
  });

  public toSerializedJson = () => superjson.serialize(this.toJson());

  public toResponse = () => NextResponse.json(this.toSerializedJson(), { status: this.statusCode });
}

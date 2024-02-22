import { NextResponse } from "next/server";

import superjson from "superjson";

import { BaseHttpError } from "../http-error";

import { type ClientErrorCode, ClientErrorCodes, type ClientErrorStatusCode } from "./codes";
import { isClientErrorResponseBody, type ClientErrorResponseBody } from "./types";

export * from "./codes";
export * from "./types";

export type ClientErrorConfig = {
  readonly code: ClientErrorCode;
  readonly statusCode?: ClientErrorStatusCode;
  readonly message?: string;
  readonly url?: string;
};

export type ClientErrorResponseConfig = {
  readonly statusCode: number;
  readonly message?: string;
  readonly url: string;
  readonly code?: never;
};

type Code<C extends ClientErrorConfig | ClientErrorResponseConfig> = C extends {
  code: infer Code extends ClientErrorCode;
}
  ? Code
  : undefined;

type StatusCode<C extends ClientErrorConfig | ClientErrorResponseConfig> = C extends {
  code: infer Code extends ClientErrorCode;
}
  ? ClientErrorStatusCode<Code>
  : C extends { statusCode: infer S extends number }
    ? S
    : never;

type Json<C extends ClientErrorConfig | ClientErrorResponseConfig> = C extends {
  code: infer Code extends ClientErrorCode;
}
  ? {
      code: Code;
      statusCode: ClientErrorStatusCode<Code>;
      message: string;
    }
  : undefined;

export class ClientError<
  C extends ClientErrorConfig | ClientErrorResponseConfig =
    | ClientErrorConfig
    | ClientErrorResponseConfig,
> extends BaseHttpError {
  private readonly config: Pick<C, "code" | "statusCode">;

  constructor({ message, url, ...config }: C) {
    super({ message, url });
    this.config = config;
  }

  public get code(): Code<C> {
    return this.config.code as Code<C>;
  }

  public get statusCode(): StatusCode<C> {
    if (this.config.statusCode !== undefined) {
      return this.config.statusCode as StatusCode<C>;
    } else if (this.code !== undefined) {
      return ClientErrorCodes.getAttribute(this.code, "statusCode") as StatusCode<C>;
    }
    throw new Error(
      "Invalid class implementation. Both the status code and the code are not defined.",
    );
  }

  public get message() {
    if (this._message) {
      return this._message;
    } else if (this.code !== undefined) {
      return ClientErrorCodes.getAttribute(this.code, "message");
    }
    return "There was an error with the request.";
  }

  public static reconstruct = (response: Response | ClientErrorResponseBody) => {
    if (isClientErrorResponseBody(response)) {
      return new ClientError(response);
    } else if (response.status >= 200 && response.status < 300) {
      throw new Error(
        "Invalid function implementation.  The response status code is not an error.",
      );
    } else if (!(response.status >= 400 && response.status < 500)) {
      throw new Error(
        "Invalid function implementation.  The response status code is not a client error.",
      );
    }
    switch (response.status) {
      case 400:
        return ClientError.BadRequest(response.statusText);
      case 401:
        return ClientError.NotAuthenticated(response.statusText);
      case 403:
        return ClientError.Forbidden(response.statusText);
      case 404:
        return ClientError.NotFound(response.statusText);
      default:
        return new ClientError({
          message: response.statusText,
          statusCode: response.status,
          url: response.url,
        });
    }
  };

  public static BadRequest = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.BAD_REQUEST, message });

  public static NotAuthenticated = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.NOT_AUTHENTICATED, message });

  public static Forbidden = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.FORBIDDEN, message });

  public static NotFound = (message?: string) =>
    new ClientError({ code: ClientErrorCodes.NOT_FOUND, message });

  public toJson = (): Json<C> =>
    ({
      code: this.code as ClientErrorCode,
      statusCode: this.statusCode as ClientErrorStatusCode,
      message: this.message,
    }) as Json<C>;

  public toSerializedJson = () => superjson.serialize(this.toJson());

  public toResponse = () => NextResponse.json(this.toSerializedJson(), { status: this.statusCode });
}

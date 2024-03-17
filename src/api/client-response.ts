import { NextResponse } from "next/server";

import superjson from "superjson";

import {
  type ClientSuccessCode,
  ClientSuccessCodes,
  type ClientSuccessStatusCode,
  type ClientSuccessResponseBody,
} from "./types";

export type ClientSuccessConfig<T> = {
  readonly data: T;
  readonly code?: ClientSuccessCode;
  readonly statusCode?: ClientSuccessStatusCode;
};

export class ClientResponse<T> {
  private readonly data: T;
  private readonly statusCode: ClientSuccessStatusCode;

  constructor({ data, code, statusCode }: ClientSuccessConfig<T>) {
    this.data = data;
    if (statusCode) {
      this.statusCode = statusCode;
    } else if (code) {
      this.statusCode = ClientSuccessCodes.getAttribute(code, "statusCode");
    } else {
      this.statusCode = ClientSuccessCodes.getAttribute("HTTP_200_OK", "statusCode");
    }
  }

  public toJson = (): ClientSuccessResponseBody<T> => ({ data: this.data });

  public toSerializedJson = () => ({ data: superjson.serialize(this.data) });

  public toResponse = () => NextResponse.json(this.toSerializedJson(), { status: this.statusCode });

  public static OK = <T>(data: T) =>
    new ClientResponse<T>({ data, code: ClientSuccessCodes.HTTP_200_OK });
}

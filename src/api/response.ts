import { NextResponse } from "next/server";

import {
  enumeratedLiterals,
  type EnumeratedLiteralsMember,
  type EnumeratedLiteralsModel,
} from "enumerated-literals";

export const ClientSuccessCodes = enumeratedLiterals(
  [{ value: "HTTP_200_OK", statusCode: 200 }] as const,
  {},
);

export type ClientSuccessCode = EnumeratedLiteralsMember<typeof ClientSuccessCodes>;

export type ClientSuccessStatusCode<C extends ClientSuccessCode = ClientSuccessCode> = Extract<
  EnumeratedLiteralsModel<typeof ClientSuccessCodes>,
  { value: C }
>["statusCode"];

export type ClientSuccessResponseBody<T> = { data: T };

export interface ClientSuccessConfig<T> {
  readonly data: T;
  readonly code?: ClientSuccessCode;
  readonly statusCode?: ClientSuccessStatusCode;
}

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

  public get json(): ClientSuccessResponseBody<T> {
    return { data: this.data };
  }

  public get serializedJson() {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires -- Temp workaround for tests. */
    const superjson = require("superjson");
    return { data: superjson.serialize(this.data) };
  }

  public get response() {
    return NextResponse.json(this.serializedJson, { status: this.statusCode });
  }

  public static OK = <T>(data: T) =>
    new ClientResponse<T>({ data, code: ClientSuccessCodes.HTTP_200_OK });
}

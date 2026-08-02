import { NextResponse } from 'next/server';

import {
  enumeratedLiterals,
  type EnumeratedLiteralsMember,
  type EnumeratedLiteralsModel,
} from 'enumerated-literals';

export const ClientSuccessCodes = enumeratedLiterals(
  [{ statusCode: 200, value: 'HTTP_200_OK' }] as const,
  {},
);

export type ClientSuccessCode = EnumeratedLiteralsMember<typeof ClientSuccessCodes>;

export type ClientSuccessStatusCode<C extends ClientSuccessCode = ClientSuccessCode> = Extract<
  EnumeratedLiteralsModel<typeof ClientSuccessCodes>,
  { value: C }
>['statusCode'];

export type ClientSuccessResponseBody<T> = { data: T };

export interface ClientSuccessConfig<T> {
  readonly code?: ClientSuccessCode;
  readonly data: T;
  readonly statusCode?: ClientSuccessStatusCode;
}

export class ClientResponse<T> {
  public static OK = <D>(data: D) =>
    new ClientResponse<D>({ code: ClientSuccessCodes.HTTP_200_OK, data });
  private readonly data: T;
  private readonly statusCode: ClientSuccessStatusCode;

  constructor({ code, data, statusCode }: ClientSuccessConfig<T>) {
    this.data = data;
    if (statusCode) {
      this.statusCode = statusCode;
    } else if (code) {
      this.statusCode = ClientSuccessCodes.getAttribute(code, 'statusCode');
    } else {
      this.statusCode = ClientSuccessCodes.getAttribute('HTTP_200_OK', 'statusCode');
    }
  }

  public get json(): ClientSuccessResponseBody<T> {
    return { data: this.data };
  }

  public get response() {
    return NextResponse.json({ data: this.data }, { status: this.statusCode });
  }
}

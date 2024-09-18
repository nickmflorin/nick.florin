import { NextResponse } from "next/server";

import {
  HttpClientError,
  type HttpClientErrorConfig,
  type JsonObject,
} from "~/integrations/http-v2";

import { type ApiClientGlobalErrorCode } from "../codes";

export interface AbstractApiClientErrorConfig extends HttpClientErrorConfig {
  readonly code: ApiClientGlobalErrorCode;
}

export abstract class AbstractApiClientError<J extends JsonObject> extends HttpClientError {
  public readonly code: ApiClientGlobalErrorCode;

  constructor({ code, ...config }: AbstractApiClientErrorConfig) {
    super(config);
    this.code = code;
  }

  public abstract get json(): J;

  public get response(): NextResponse<{ error: J }> {
    return NextResponse.json<{ error: J }>({ error: this.json }, { status: this.status });
  }
}

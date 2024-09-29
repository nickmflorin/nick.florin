import type { HttpMethod } from "./types";

import { isError } from "~/application/errors";

export interface HttpErrorConfig {
  readonly message?: string;
  readonly url?: string;
  readonly method?: HttpMethod;
}

export abstract class BaseHttpError extends Error {
  protected readonly url: string | null = null;
  public readonly method: HttpMethod | null = null;

  constructor({ url, message, method }: HttpErrorConfig) {
    super(
      message
        ? method
          ? `[${method}] ${message}`
          : message
        : url && method
          ? `[${method}] There was an error making a request to ${url}.`
          : url
            ? `There was an error making a request to ${url}.`
            : "There was an error with the request.",
    );
    this.name = "HttpError";
    this.url = url ?? null;
    this.method = method ?? null;
  }
}

export type NetworkErrorClass<C extends HttpNetworkError> = {
  new (error: Error, config: HttpErrorConfig): C;
};

export class HttpNetworkError extends BaseHttpError {
  public readonly error: Error;

  constructor(error: Error, config: HttpErrorConfig) {
    super({
      ...config,
      message:
        config.message ??
        (config.url
          ? `There was a network error making a request to ${config.url}: ${error}`
          : `There was a network error with the request: ${error}`),
    });
    this.error = error;
    this.name = "HttpNetworkError";
  }

  public get logData() {
    return {
      url: this.url,
      method: this.method,
      error: this.error,
      message: this.message,
    };
  }
}

export interface HttpClientErrorConfig extends HttpErrorConfig {
  readonly status: number;
}

export type ClientErrorClass<C extends HttpClientError> = {
  new (config: HttpClientErrorConfig): C;
};

export class HttpClientError extends BaseHttpError {
  public readonly status: number;

  constructor({ status, ...config }: HttpClientErrorConfig) {
    super({
      ...config,
      message: config.message
        ? `[${status}] ${config.message}`
        : config.url
          ? `[${status}] There was a client error making a request to ${config.url}.`
          : `[${status}] There was a client error with the request.`,
    });
    this.status = status;
    this.name = "HttpClientError";
  }

  public get logData() {
    return {
      url: this.url,
      method: this.method,
      status: this.status,
      message: this.message,
    };
  }
}

export type SerializationErrorClass<C extends HttpSerializationError> = {
  new (config: HttpClientErrorConfig): C;
};

export class HttpSerializationError extends HttpClientError {
  constructor(config: HttpClientErrorConfig) {
    super({
      ...config,
      message: config.message
        ? `[${config.status}] ${config.message}`
        : config.url
          ? `[${config.status}] There was an error serializing/processing the response for the request to ${config.url}.`
          : `[${config.status}] There was an error serializing/processing the response from the request.`,
    });
    this.name = "HttpSerializationError";
  }
}

export type HttpError = HttpNetworkError | HttpClientError | HttpSerializationError;

export const isHttpError = (e: unknown): e is HttpError =>
  isError(e) &&
  (e instanceof HttpNetworkError ||
    e instanceof HttpClientError ||
    e instanceof HttpSerializationError);

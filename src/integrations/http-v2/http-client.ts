import { type Required } from "utility-types";

import type * as query from "./query";

import { UnreachableCaseError, isError } from "~/application/errors";

import * as errors from "./errors";
import { withoutLeadingSlashes, withoutTrailingSlashes } from "./paths";
import { addQueryParamsToUrl } from "./query";
import * as types from "./types";

const DefaultDynamicOptions: {
  [key in types.HttpMethod]: Required<ClientDynamicRequestOptions>;
} = {
  GET: { processed: true, strict: false },
  POST: { processed: true, strict: false },
  PATCH: { processed: true, strict: false },
  DELETE: { processed: false, strict: false },
};

export type ResponseMeta = {
  readonly url: string;
  readonly status: number;
  readonly method: types.HttpMethod;
};

/**
 * Options that are dynamically provided when a requesting method on the {@link HttpClient}  is
 * called, excluding options that are native to the fetch API's {@link Request} object.
 *
 * These options are used by the {@link HttpClient} to determine the manner in which the method
 * returns.
 */
export type ClientDynamicRequestOptions<
  S extends boolean = boolean,
  P extends boolean = boolean,
> = {
  /**
   * Controls whether or not the requesting method on the {@link HttpClient} instance should throw
   * an {@link HttpError} in the case that the request fails, or if the requesting method on the
   * {@link HttpClient} should instead simply include the error as  a part of the requesting
   * method's return.
   */
  readonly strict?: S;
  /**
   * Controls whether or not the requesting method on the {@link HttpClient} instance should
   * return the {@link Response} object itself, or the parsed JSON body of the {@link Response}.
   */
  readonly processed?: P;
};

/* Options for each request that are provided when the requesting method is called. */
export type ClientRequestOptions<
  S extends boolean = boolean,
  J extends boolean = boolean,
> = ClientDynamicRequestOptions<S, J> & Omit<RequestInit, "body" | "method">;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ClientOkResponseProcessor<T = any, E extends errors.HttpClientError = any> = (
  response: Response,
  params: { readonly url: string; readonly method: types.HttpMethod; readonly status: number },
) => Promise<{ data: T; error?: never } | { data?: never; error: E }>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ClientNotOkResponseProcessor<E extends errors.HttpClientError = any> = (
  response: Response,
  params: { readonly url: string; readonly method: types.HttpMethod; readonly status: number },
) => Promise<E>;

export type HttpClientResponseProcessors = {
  readonly okayResponseProcessor?: ClientOkResponseProcessor;
  readonly notOkayResponseProcessor?: ClientNotOkResponseProcessor;
};

type InferredOkayProcessorError<P extends HttpClientResponseProcessors> = P extends {
  readonly okayResponseProcessor?: infer Pi;
}
  ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Pi extends ClientOkResponseProcessor<any, infer E extends errors.HttpClientError>
    ? E
    : never
  : errors.HttpClientError;

type InferredNotOkayProcessorError<P extends HttpClientResponseProcessors> = P extends {
  readonly notOkayResponseProcessor?: infer Pi;
}
  ? Pi extends ClientNotOkResponseProcessor<infer E extends errors.HttpClientError>
    ? E
    : never
  : errors.HttpClientError;

type ClientResponseOrError<
  T,
  N extends errors.HttpNetworkError,
  P extends HttpClientResponseProcessors,
> =
  | {
      readonly error: N | InferredNotOkayProcessorError<P> | InferredOkayProcessorError<P>;
      readonly response?: never;
      readonly meta?: never;
    }
  | { readonly response: T; readonly error?: never; readonly meta: ResponseMeta };

export type ClientResponse<
  T,
  N extends errors.HttpNetworkError,
  P extends HttpClientResponseProcessors,
> = T | ClientResponseOrError<T, N, P>;

export type HttpClientConfig<
  N extends errors.HttpNetworkError,
  P extends HttpClientResponseProcessors,
> = RequestInit & {
  readonly baseUrl?: string;
  readonly processors: P;
  readonly NetworkErrorClass: errors.NetworkErrorClass<N>;
};

export type HttpClientProcessedResponseData<P extends HttpClientResponseProcessors> = P extends {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly okayResponseProcessor: ClientOkResponseProcessor<infer T, any>;
}
  ? T
  : Response;

/**
 * A standardized interface that should be used to make HTTP requests using the native
 * {@link fetch} API in the application.
 */
export class HttpClient<N extends errors.HttpNetworkError, P extends HttpClientResponseProcessors> {
  private readonly config: HttpClientConfig<N, P>;

  constructor(config: HttpClientConfig<N, P>) {
    this.config = config || {};
  }

  private get baseUrl(): string | null {
    return this.config?.baseUrl ?? null;
  }

  private get NetworkErrorClass(): errors.NetworkErrorClass<N> {
    return this.config.NetworkErrorClass;
  }

  private constructUrl(path: string): string {
    if (this.baseUrl) {
      return `${withoutTrailingSlashes(this.baseUrl)}/${withoutLeadingSlashes(path)}`;
    }
    return path;
  }

  private processOkResponse = async (
    response: Response,
    params: { readonly url: string; readonly method: types.HttpMethod; readonly status: number },
  ): Promise<
    | { data: HttpClientProcessedResponseData<P>; error?: never }
    | { error: InferredOkayProcessorError<P>; data?: never }
  > => {
    const processor = this.config.processors.okayResponseProcessor as ClientOkResponseProcessor<
      HttpClientProcessedResponseData<P>,
      InferredOkayProcessorError<P>
    >;
    if (!processor) {
      return { data: response as HttpClientProcessedResponseData<P> };
    }
    return await processor(response, params);
  };

  private processNotOkResponse = async (
    response: Response,
    params: { readonly url: string; readonly method: types.HttpMethod; readonly status: number },
  ): Promise<InferredNotOkayProcessorError<P>> => {
    const processor = this.config.processors
      .notOkayResponseProcessor as ClientNotOkResponseProcessor<InferredNotOkayProcessorError<P>>;
    if (!processor) {
      return new errors.HttpClientError(params) as InferredNotOkayProcessorError<P>;
    }
    return await processor(response, params);
  };

  private addQueryParamsToUrl(url: string, query?: query.QueryParamObj | undefined): string {
    return addQueryParamsToUrl(url, query);
  }

  private get staticRequestOptions(): RequestInit {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { baseUrl, ...rest } = this.config;
    return rest;
  }

  private static getDynamicOption = (
    optionName: keyof ClientDynamicRequestOptions,
    method: types.HttpMethod,
    options: ClientRequestOptions = {},
  ): boolean => {
    const v = options[optionName];
    return v === undefined ? DefaultDynamicOptions[method][optionName] : v;
  };

  private request = async (
    path: string,
    method: types.HttpMethod,
    options?: ClientRequestOptions & { readonly body?: string },
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> => {
    let response: Response | null = null;
    let error: N | InferredNotOkayProcessorError<P> | InferredOkayProcessorError<P> | null = null;

    const url = this.constructUrl(path);
    const request = new Request(url, { ...this.staticRequestOptions, ...options, method });
    try {
      response = await fetch(request);
    } catch (e) {
      if (!isError(e)) {
        throw new Error(`Fetch API unexpectedly threw non-Error object: ${e}`);
      }
      /* Here, the fetch call failed without rendering a response - this happens when a connection
         could not be made to the server. */
      error = new this.NetworkErrorClass(e, {
        url: request.url,
        method: request.method.toUpperCase() as types.HttpMethod,
      });
    }
    let returnResponse: HttpClientProcessedResponseData<P> | Response | null = null;

    if (response !== null && !response.ok) {
      // Here, the server returned a response - but the response had a 4xx or 5xx status code.
      error = await this.processNotOkResponse(response, {
        method: request.method.toUpperCase() as types.HttpMethod,
        url: request.url,
        status: response.status,
      });
    } else if (response !== null) {
      if (HttpClient.getDynamicOption("processed", method, options)) {
        const processed = await this.processOkResponse(response, {
          method: request.method.toUpperCase() as types.HttpMethod,
          url: request.url,
          status: response.status,
        });
        if (processed.data) {
          returnResponse = processed.data;
        } else if (processed.error) {
          error = processed.error;
        } else {
          throw new Error("The request data processor did not return data or an error object!");
        }
      } else {
        returnResponse = response;
      }
    }
    if (error) {
      /* If the method was called with the 'strict' flag, the calling logic expects that the method
         returns a Response object if there is a valid response, and throws an Error otherwise. */
      if (HttpClient.getDynamicOption("strict", method, options)) {
        throw error;
      }
      return { error };
    } else if (returnResponse) {
      /* If the method was called with the 'strict' flag, the calling logic is already expecting
         that (and the return of the method on the HttpClient that was called is typed such that)
         the return is simply just the Response object or the JSON response body - because if there
         was an error, it would have already been thrown. */
      return HttpClient.getDynamicOption("strict", method, options)
        ? returnResponse
        : {
            response: returnResponse,
            meta: {
              method: request.method.toUpperCase() as types.HttpMethod,
              url: request.url,
              /* This type coercion is safe because the 'returnResponse' will only ever be non-null
                 if the 'response' is present. */
              status: (response as Response).status,
            },
          };
    } else {
      throw new UnreachableCaseError("This should never happen!");
    }
  };

  public async get(
    path: string,
    query: query.QueryParamObj | undefined,
    options: Required<ClientRequestOptions<true, true>, "strict">,
  ): Promise<HttpClientProcessedResponseData<P>>;

  public async get(
    path: string,
    query?: query.QueryParamObj,
    options?: ClientRequestOptions<false, true>,
  ): Promise<ClientResponseOrError<HttpClientProcessedResponseData<P>, N, P>>;

  public async get(
    path: string,
    query: query.QueryParamObj,
    options: Required<ClientRequestOptions<true, false>, keyof ClientDynamicRequestOptions>,
  ): Promise<Response>;

  public async get(
    path: string,
    query?: query.QueryParamObj,
    options?: Required<ClientRequestOptions<false, false>, "processed">,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a GET request to the provided path, {@link string} with the provided query,
   * {@link types.RawQuery}.
   *
   * @param {string} path The path to send the GET request.
   *
   * @param {types.RawQuery} query The query parameters that should be embedded in the URL.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async get(
    path: string,
    query?: query.QueryParamObj,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> {
    path = this.addQueryParamsToUrl(path, query);
    return await this.request(path, types.HttpMethods.GET, options);
  }

  public async post(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<true, true>, "strict">,
  ): Promise<HttpClientProcessedResponseData<P>>;

  public async post(
    path: string,
    body?: types.JsonObject,
    options?: ClientRequestOptions<false, true>,
  ): Promise<ClientResponseOrError<HttpClientProcessedResponseData<P>, N, P>>;

  public async post(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<true, false>, keyof ClientDynamicRequestOptions>,
  ): Promise<Response>;

  public async post(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<false, false>, "processed">,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a POST request to the provided path, {@link string}, with the provided body, {@link P}.
   *
   * @param {string} path The path to send the POST request.
   *
   * @param {types.JsonObject} body The JSON body that should be attached to the request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<CClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async post(
    path: string,
    body?: types.JsonObject,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> {
    return await this.request(path, types.HttpMethods.POST, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  public async delete(
    path: string,
    // For a DELETE request, the default value of the `processed` option is false.
    options: Required<ClientRequestOptions<true, true>, keyof ClientDynamicRequestOptions>,
  ): Promise<HttpClientProcessedResponseData<P>>;

  public async delete(
    path: string,
    // For a DELETE request, the default value of the `processed` option is false.
    options: Required<ClientRequestOptions<false, true>, "processed">,
  ): Promise<ClientResponseOrError<HttpClientProcessedResponseData<P>, N, P>>;

  public async delete(
    path: string,
    options: Required<ClientRequestOptions<true, false>, "strict">,
  ): Promise<Response>;

  public async delete(
    path: string,
    options?: ClientRequestOptions<false, false>,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a DELETE request to the provided path, {@link string}.
   *
   * @param {string} path The path to send the DELETE request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   Unlike the other HTTP methods attached to the {@link HttpClient}, for a DELETE request, the
   *   default value of the `processed` option is false.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async delete(
    path: string,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> {
    return await this.request(path, types.HttpMethods.DELETE, options);
  }

  public async patch(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<true, true>, "strict">,
  ): Promise<HttpClientProcessedResponseData<P>>;

  public async patch(
    path: string,
    body?: types.JsonObject,
    options?: ClientRequestOptions<false, true>,
  ): Promise<ClientResponseOrError<HttpClientProcessedResponseData<P>, N, P>>;

  public async patch(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<true, false>, keyof ClientDynamicRequestOptions>,
  ): Promise<Response>;

  public async patch(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<false, false>, "processed">,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a PATCH request to the provided path, {@link string} with the provided body, {@link P}.
   *
   * @param {string} path The path to send the PATCH request.
   *
   * @param {P} body The JSON body that should be attached to the request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async patch(
    path: string,
    body?: types.JsonObject,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> {
    return await this.request(path, types.HttpMethods.PATCH, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
}

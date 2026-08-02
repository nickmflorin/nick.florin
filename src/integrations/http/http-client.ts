import { type Required } from 'utility-types';

import type * as query from './query';

import { isError, UnreachableCaseError } from '~/application/errors';

import * as errors from './errors';
import { withoutLeadingSlashes, withoutTrailingSlashes } from './paths';
import { addQueryParamsToUrl } from './query';
import * as types from './types';

const DefaultDynamicOptions: Record<types.HttpMethod, Required<ClientDynamicRequestOptions>> = {
  DELETE: { processed: false, strict: false },
  GET: { processed: true, strict: false },
  PATCH: { processed: true, strict: false },
  POST: { processed: true, strict: false },
};

export type ResponseMeta = {
  readonly method: types.HttpMethod;
  readonly status: number;
  readonly url: string;
};

/**
 * Options that are dynamically provided when a requesting method on the {@link HttpClient} is
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
   * Controls whether or not the requesting method on the {@link HttpClient} instance should
   * return the {@link Response} object itself, or the parsed JSON body of the {@link Response}.
   */
  readonly processed?: P;
  /**
   * Controls whether or not the requesting method on the {@link HttpClient} instance should throw
   * an {@link HttpError} in the case that the request fails, or if the requesting method on the
   * {@link HttpClient} should instead simply include the error as a part of the requesting
   * method's return.
   */
  readonly strict?: S;
};

/**
 * Options for each request that are provided when the requesting method is called.
 */
export type ClientRequestOptions<
  S extends boolean = boolean,
  J extends boolean = boolean,
> = ClientDynamicRequestOptions<S, J> & Omit<RequestInit, 'body' | 'method'>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ClientOkResponseProcessor<T = any, E extends errors.HttpClientError = any> = (
  response: Response,
  params: { readonly method: types.HttpMethod; readonly status: number; readonly url: string },
) => Promise<{ data: T; error?: never } | { data?: never; error: E }>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ClientNotOkResponseProcessor<E extends errors.HttpClientError = any> = (
  response: Response,
  params: { readonly method: types.HttpMethod; readonly status: number; readonly url: string },
) => Promise<E>;

export type HttpClientResponseProcessors = {
  readonly notOkayResponseProcessor?: ClientNotOkResponseProcessor;
  readonly okayResponseProcessor?: ClientOkResponseProcessor;
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

export type ClientResponseOrError<
  T,
  N extends errors.HttpNetworkError,
  P extends HttpClientResponseProcessors,
> =
  | {
      readonly error: InferredNotOkayProcessorError<P> | InferredOkayProcessorError<P> | N;
      readonly meta?: never;
      readonly response?: never;
    }
  | { readonly error?: never; readonly meta: ResponseMeta; readonly response: T };

export type ClientResponse<
  T,
  N extends errors.HttpNetworkError,
  P extends HttpClientResponseProcessors,
> = ClientResponseOrError<T, N, P> | T;

export type HttpClientConfig<
  N extends errors.HttpNetworkError,
  P extends HttpClientResponseProcessors,
> = {
  readonly baseUrl?: string;
  readonly NetworkErrorClass: errors.NetworkErrorClass<N>;
  readonly processors: P;
} & RequestInit;

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
  private static getDynamicOption = (
    optionName: keyof ClientDynamicRequestOptions,
    method: types.HttpMethod,
    options: ClientRequestOptions = {},
  ): boolean => {
    const v = options[optionName];
    return v ?? DefaultDynamicOptions[method][optionName];
  };
  private readonly config: HttpClientConfig<N, P>;
  private processNotOkResponse = async (
    response: Response,
    params: { readonly method: types.HttpMethod; readonly status: number; readonly url: string },
  ): Promise<InferredNotOkayProcessorError<P>> => {
    const processor = this.config.processors.notOkayResponseProcessor as
      ClientNotOkResponseProcessor<InferredNotOkayProcessorError<P>> | undefined;
    if (!processor) {
      return new errors.HttpClientError(params) as InferredNotOkayProcessorError<P>;
    }
    return await processor(response, params);
  };
  private processOkResponse = async (
    response: Response,
    params: { readonly method: types.HttpMethod; readonly status: number; readonly url: string },
  ): Promise<
    | { data: HttpClientProcessedResponseData<P>; error?: never }
    | { data?: never; error: InferredOkayProcessorError<P> }
  > => {
    const processor = this.config.processors.okayResponseProcessor as
      | ClientOkResponseProcessor<HttpClientProcessedResponseData<P>, InferredOkayProcessorError<P>>
      | undefined;
    if (!processor) {
      return { data: response as HttpClientProcessedResponseData<P> };
    }
    return await processor(response, params);
  };
  private request = async (
    path: string,
    method: types.HttpMethod,
    options?: { readonly body?: string } & ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> => {
    let response: null | Response = null;
    let error: InferredNotOkayProcessorError<P> | InferredOkayProcessorError<P> | N | null = null;

    const url = this.constructUrl(path);
    const request = new Request(url, { ...this.staticRequestOptions, ...options, method });
    try {
      response = await fetch(request);
    } catch (e) {
      if (!isError(e)) {
        throw new Error(`Fetch API unexpectedly threw non-Error object: ${String(e)}`);
      }
      /* Here, the fetch call failed without rendering a response - this happens when a connection
         could not be made to the server. */
      error = new this.NetworkErrorClass(e, {
        method: request.method.toUpperCase() as types.HttpMethod,
        url: request.url,
      });
    }
    let returnResponse: HttpClientProcessedResponseData<P> | null | Response = null;

    if (response !== null && !response.ok) {
      error = await this.processNotOkResponse(response, {
        method: request.method.toUpperCase() as types.HttpMethod,
        status: response.status,
        url: request.url,
      });
    } else if (response !== null) {
      if (HttpClient.getDynamicOption('processed', method, options)) {
        const processed = await this.processOkResponse(response, {
          method: request.method.toUpperCase() as types.HttpMethod,
          status: response.status,
          url: request.url,
        });
        if (processed.data) {
          returnResponse = processed.data;
        } else if (processed.error) {
          error = processed.error;
        } else {
          throw new Error('The request data processor did not return data or an error object!');
        }
      } else {
        returnResponse = response;
      }
    }
    if (error) {
      /* If the method was called with the 'strict' flag, the calling logic expects that the method
         returns a Response object if there is a valid response, and throws an Error otherwise. */
      if (HttpClient.getDynamicOption('strict', method, options)) {
        /* Every member of the error union extends Error, but the processor error types are
           conditional types that the compiler cannot resolve to an Error subclass here. */
        throw error as Error;
      }
      return { error };
    } else if (returnResponse) {
      /* If the method was called with the 'strict' flag, the calling logic is already expecting
         that (and the return of the method on the HttpClient that was called is typed such that)
         the return is simply just the Response object or the JSON response body - because if there
         was an error, it would have already been thrown. */
      return HttpClient.getDynamicOption('strict', method, options)
        ? returnResponse
        : {
            meta: {
              method: request.method.toUpperCase() as types.HttpMethod,
              /* This type coercion is safe because the 'returnResponse' will only ever be non-null
                 if the 'response' is present. */
              status: (response as Response).status,
              url: request.url,
            },
            response: returnResponse,
          };
    }
    throw new UnreachableCaseError('This should never happen!');
  };

  constructor(config: HttpClientConfig<N, P>) {
    this.config = config;
  }

  private addQueryParamsToUrl(url: string, query?: query.QueryParamObj): string {
    return addQueryParamsToUrl(url, query);
  }

  private constructUrl(path: string): string {
    if (this.baseUrl) {
      return `${withoutTrailingSlashes(this.baseUrl)}/${withoutLeadingSlashes(path)}`;
    }
    return path;
  }

  public async delete(
    path: string,
    options: Required<ClientRequestOptions<true, true>, keyof ClientDynamicRequestOptions>,
  ): Promise<HttpClientProcessedResponseData<P>>;

  public async delete(
    path: string,
    options: Required<ClientRequestOptions<false, true>, 'processed'>,
  ): Promise<ClientResponseOrError<HttpClientProcessedResponseData<P>, N, P>>;

  public async delete(
    path: string,
    options: Required<ClientRequestOptions<true, false>, 'strict'>,
  ): Promise<Response>;

  public async delete(
    path: string,
    options?: ClientRequestOptions<false, false>,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a DELETE request to the provided path, {@link string}.
   *
   * @param {string} path The path to send the DELETE request.
   * @param {ClientRequestOptions} options
   *   The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  Unlike the other HTTP methods
   *   attached to the {@link HttpClient}, for a DELETE request, the default value of the
   *   `processed` option is false.
   *
   * @see {@link HttpClient}
   * @see {@link ClientDynamicRequestOptions}
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   */
  public async delete(
    path: string,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> {
    return await this.request(path, types.HttpMethods.DELETE, options);
  }

  public async get(
    path: string,
    query: query.QueryParamObj | undefined,
    options: Required<ClientRequestOptions<true, true>, 'strict'>,
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
    options?: Required<ClientRequestOptions<false, false>, 'processed'>,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a GET request to the provided path, {@link string}, with the provided query,
   * {@link query.QueryParamObj}.
   *
   * @param {string} path The path to send the GET request.
   * @param {query.QueryParamObj} query The query parameters that should be embedded in the URL.
   * @param {ClientRequestOptions} options
   *   The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   * @see {@link HttpClient}
   * @see {@link ClientDynamicRequestOptions}
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   */
  public async get(
    path: string,
    query?: query.QueryParamObj,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>> {
    const url = this.addQueryParamsToUrl(path, query);
    return await this.request(url, types.HttpMethods.GET, options);
  }

  public async patch(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<true, true>, 'strict'>,
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
    options: Required<ClientRequestOptions<false, false>, 'processed'>,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a PATCH request to the provided path, {@link string}, with the provided body,
   * {@link types.JsonObject}.
   *
   * @param {string} path The path to send the PATCH request.
   * @param {types.JsonObject} body The JSON body that should be attached to the request.
   * @param {ClientRequestOptions} options
   *   The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   * @see {@link ClientDynamicRequestOptions}
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
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

  public async post(
    path: string,
    body: types.JsonObject | undefined,
    options: Required<ClientRequestOptions<true, true>, 'strict'>,
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
    options: Required<ClientRequestOptions<false, false>, 'processed'>,
  ): Promise<ClientResponseOrError<Response, N, P>>;

  /**
   * Sends a POST request to the provided path, {@link string}, with the provided body,
   * {@link types.JsonObject}.
   *
   * @param {string} path The path to send the POST request.
   * @param {types.JsonObject} body The JSON body that should be attached to the request.
   * @param {ClientRequestOptions} options
   *   The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   * @see {@link HttpClient}
   * @see {@link ClientDynamicRequestOptions}
   *
   * @returns {Promise<ClientResponse<HttpClientProcessedResponseData<P> | Response, N, P>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
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

  private get baseUrl(): null | string {
    return this.config.baseUrl ?? null;
  }

  private get NetworkErrorClass(): errors.NetworkErrorClass<N> {
    return this.config.NetworkErrorClass;
  }

  private get staticRequestOptions(): RequestInit {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { baseUrl, ...rest } = this.config;
    return rest;
  }
}

export type InferredClientResponseOrError<T, C> =
  C extends HttpClient<
    infer N extends errors.HttpNetworkError,
    infer P extends HttpClientResponseProcessors
  >
    ? ClientResponseOrError<T, N, P>
    : never;

import {
  HttpClient,
  HttpClientError,
  type HttpMethod,
  HttpMethods,
  HttpNetworkError,
  STATUS_CODES,
} from '~/integrations/http';

type MockFetchOptions = {
  readonly json: Record<string, unknown>;
  readonly method?: HttpMethod;
  readonly ok?: boolean;
  readonly status?: number;
  readonly url: string;
};

/* The client only ever reads these fields off the Response and Request it is handed, so the mocks
   implement just those and are widened to the full DOM interfaces here rather than at each call
   site.  Constructing real Response and Request objects would pull the rest of the fetch machinery
   into tests that are only exercising the client's own behavior. */
const mockResponse = (fields: Pick<Response, 'json' | 'ok' | 'status' | 'url'>) =>
  fields as Response;
const mockRequest = (fields: Pick<Request, 'method' | 'url'>) => fields as Request;

const mockFetchResponse = ({
  json,
  method = HttpMethods.GET,
  ok = true,
  status = STATUS_CODES.HTTP_200_OK,
  url,
}: MockFetchOptions) => {
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(mockResponse({ json: async () => json, ok, status, url }));
  jest.spyOn(global, 'Request').mockImplementation(() => mockRequest({ method, url }));
};

const mockFetchNetworkError = ({
  method = HttpMethods.GET,
  url,
}: Pick<MockFetchOptions, 'method' | 'url'>) => {
  jest.spyOn(global, 'fetch').mockImplementation(
    () =>
      new Promise(() => {
        throw new Error('The request failed.');
      }),
  );
  jest.spyOn(global, 'Request').mockImplementation(() => mockRequest({ method, url }));
};

const mockFetchClientError = ({
  method = HttpMethods.GET,
  status = STATUS_CODES.HTTP_400_BAD_REQUEST,
  url,
}: MockFetchOptions) => mockFetchResponse({ json: {}, method, ok: false, status, url });

describe('hTTP Client properly functions', () => {
  const client = new HttpClient({
    NetworkErrorClass: HttpNetworkError,
    processors: {
      okayResponseProcessor: async (response): Promise<{ data: unknown }> => {
        const data: unknown = await response.json();
        return { data };
      },
    },
  });

  describe('gET request properly returns', () => {
    const URL = 'https://app.txelects.com/api/bills/5/';
    const MOCK = {
      json: {
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      },
      method: HttpMethods.GET,
      url: URL,
    };

    it('properly returns successful response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.get('/api/bills/5');
      expect(result).toStrictEqual({
        meta: {
          method: HttpMethods.GET,
          status: 200,
          url: 'https://app.txelects.com/api/bills/5/',
        },
        response: { data: { description: 'Bill Description', id: '5', name: 'Bill A' } },
      });
    });

    it('properly returns successful raw response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const { response } = await client.get('/api/bills/5/', {}, { processed: false });
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });

    it('properly returns successful response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.get('/api/bills/5', {}, { strict: true });
      expect(result).toStrictEqual({
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      });
    });

    it('properly returns successful raw response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const response = await client.get('/api/bills/', {}, { processed: false, strict: true });
      expect(response).toBeDefined();
      expect(response.url).toBe(URL);
    });

    it('properly returns a network error when not strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const { error } = await client.get('/api/bills/5', {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toStrictEqual(HttpMethods.GET);
      expect(error?.message).toStrictEqual(
        '[GET] There was a network error making a request to ' +
          'https://app.txelects.com/api/bills/5/: Error: The request failed.',
      );
    });

    it('properly returns a client error when not strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const { error } = await client.get('/api/bills/5', {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toStrictEqual(HttpMethods.GET);
      expect(error?.message).toStrictEqual(
        '[GET] [400] There was a client error making a request to ' +
          'https://app.txelects.com/api/bills/5/.',
      );
    });

    it('properly throws a network error when strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.get('/api/bills/5', {}, { strict: true });
      await expect(fn).rejects.toThrow(HttpNetworkError);
    });

    it('properly throws a client error when strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const fn = async () => await client.get('/api/bills/5', {}, { strict: true });
      await expect(fn).rejects.toThrow(HttpClientError);
    });
  });

  describe('pOST request properly returns', () => {
    const URL = 'https://app.txelects.com/api/bills/';
    const MOCK = {
      json: {
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      },
      method: HttpMethods.POST,
      url: URL,
    };

    it('properly returns successful response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.post('/api/bills/', { name: 'Bill A' });
      expect(result).toStrictEqual({
        meta: { method: HttpMethods.POST, status: 200, url: 'https://app.txelects.com/api/bills/' },
        response: { data: { description: 'Bill Description', id: '5', name: 'Bill A' } },
      });
    });

    it('properly returns successful raw response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const { response } = await client.post(
        '/api/bills/',
        { name: 'Bill A' },
        { processed: false },
      );
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });

    it('properly returns successful response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.post('/api/bills/', { name: 'Bill A' }, { strict: true });
      expect(result).toStrictEqual({
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      });
    });

    it('properly returns successful raw response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const response = await client.post(
        '/api/bills/',
        { name: 'Bill A' },
        { processed: false, strict: true },
      );
      expect(response).toBeDefined();
      expect(response.url).toBe(URL);
    });

    it('properly returns a network error when not strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const { error } = await client.post('/api/bills/', {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toStrictEqual(HttpMethods.POST);
      expect(error?.message).toStrictEqual(
        '[POST] There was a network error making a request to ' +
          'https://app.txelects.com/api/bills/: Error: The request failed.',
      );
    });

    it('properly returns a client error when not strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const { error } = await client.post('/api/bills/5', {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toStrictEqual(HttpMethods.POST);
      expect(error?.message).toStrictEqual(
        '[POST] [400] There was a client error making a request to ' +
          'https://app.txelects.com/api/bills/.',
      );
    });

    it('properly throws a network error when strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.post('/api/bills/', {}, { strict: true });
      await expect(fn).rejects.toThrow(HttpNetworkError);
    });

    it('properly throws a client error when strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const fn = async () => await client.post('/api/bills', {}, { strict: true });
      await expect(fn).rejects.toThrow(HttpClientError);
    });
  });

  describe('pATCH request properly returns', () => {
    const URL = 'https://app.txelects.com/api/bills/5/';
    const MOCK = {
      json: {
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      },
      method: HttpMethods.PATCH,
      url: URL,
    };

    it('properly returns successful response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.patch('/api/bills/5/', { name: 'Bill A' });
      expect(result).toStrictEqual({
        meta: {
          method: HttpMethods.PATCH,
          status: 200,
          url: 'https://app.txelects.com/api/bills/5/',
        },
        response: { data: { description: 'Bill Description', id: '5', name: 'Bill A' } },
      });
    });

    it('properly returns successful raw response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const { response } = await client.patch(
        '/api/bills/5/',
        { name: 'Bill A' },
        { processed: false },
      );
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });

    it('properly returns successful response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.patch('/api/bills/5/', { name: 'Bill A' }, { strict: true });
      expect(result).toStrictEqual({
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      });
    });

    it('properly returns successful raw response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const response = await client.patch(
        '/api/bills/5/',
        { name: 'Bill A' },
        { processed: false, strict: true },
      );
      expect(response).toBeDefined();
      expect(response.url).toBe(URL);
    });

    it('properly returns a network error when not strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const { error } = await client.patch('/api/bills/5', {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toStrictEqual(HttpMethods.PATCH);
      expect(error?.message).toStrictEqual(
        '[PATCH] There was a network error making a request to ' +
          'https://app.txelects.com/api/bills/5/: Error: The request failed.',
      );
    });

    it('properly returns a client error when not strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const { error } = await client.patch('/api/bills/5', {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toStrictEqual(HttpMethods.PATCH);
      expect(error?.message).toStrictEqual(
        '[PATCH] [400] There was a client error making a request to ' +
          'https://app.txelects.com/api/bills/5/.',
      );
    });

    it('properly throws a network error when strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.patch('/api/bills/5', {}, { strict: true });
      await expect(fn).rejects.toThrow(HttpNetworkError);
    });

    it('properly throws a client error when strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const fn = async () => await client.patch('/api/bills/5', {}, { strict: true });
      await expect(fn).rejects.toThrow(HttpClientError);
    });
  });

  describe('dELETE request properly returns', () => {
    const URL = 'https://app.txelects.com/api/bills/5/';
    const MOCK = {
      json: {
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      },
      method: HttpMethods.DELETE,
      url: URL,
    };

    it('properly returns successful response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.delete('/api/bills/5/', { processed: true });
      expect(result).toStrictEqual({
        meta: {
          method: HttpMethods.DELETE,
          status: 200,
          url: 'https://app.txelects.com/api/bills/5/',
        },
        response: { data: { description: 'Bill Description', id: '5', name: 'Bill A' } },
      });
    });

    it('properly returns successful raw response when not strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const { response } = await client.delete('/api/bills/5/');
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });

    it('properly returns successful response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const result = await client.delete('/api/bills/5/', { processed: true, strict: true });
      expect(result).toStrictEqual({
        data: { description: 'Bill Description', id: '5', name: 'Bill A' },
      });
    });

    it('properly returns successful raw response when strict', async () => {
      expect.hasAssertions();
      mockFetchResponse(MOCK);
      const response = await client.delete('/api/bills/5/', { strict: true });
      expect(response).toBeDefined();
      expect(response.url).toBe(URL);
    });

    it('properly returns a network error when not strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const { error } = await client.delete('/api/bills/5', { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toStrictEqual(HttpMethods.DELETE);
      expect(error?.message).toStrictEqual(
        '[DELETE] There was a network error making a request to ' +
          'https://app.txelects.com/api/bills/5/: Error: The request failed.',
      );
    });

    it('properly returns a client error when not strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const { error } = await client.delete('/api/bills/5', { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toStrictEqual(HttpMethods.DELETE);
      expect(error?.message).toStrictEqual(
        '[DELETE] [400] There was a client error making a request to ' +
          'https://app.txelects.com/api/bills/5/.',
      );
    });

    it('properly throws a network error when strict', async () => {
      expect.hasAssertions();
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.delete('/api/bills/5', { strict: true });
      await expect(fn).rejects.toThrow(HttpNetworkError);
    });

    it('properly throws a client error when strict', async () => {
      expect.hasAssertions();
      mockFetchClientError(MOCK);
      const fn = async () => await client.delete('/api/bills/5', { strict: true });
      await expect(fn).rejects.toThrow(HttpClientError);
    });
  });
});

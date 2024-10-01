import {
  HttpNetworkError,
  HttpClientError,
  HttpClient,
  type HttpMethod,
  STATUS_CODES,
  HttpMethods,
} from "~/integrations/http";

type MockFetchOptions = {
  readonly json: Record<string, unknown>;
  readonly status?: number;
  readonly ok?: boolean;
  readonly method?: HttpMethod;
  readonly url: string;
};

const mockFetchResponse = ({
  json,
  url,
  status = STATUS_CODES.HTTP_200_OK,
  ok = true,
  method = HttpMethods.GET,
}: MockFetchOptions) => {
  global.fetch = jest.fn().mockImplementation(
    () =>
      new Promise(resolve =>
        resolve({
          url,
          ok,
          status,
          json: async () => json,
        }),
      ),
  );
  global.Request = jest.fn().mockImplementation(() => ({ method, url }));
};

const mockFetchNetworkError = ({
  url,
  method = HttpMethods.GET,
}: Pick<MockFetchOptions, "url" | "method">) => {
  global.fetch = jest.fn().mockImplementation(
    () =>
      new Promise(() => {
        throw new Error("The request failed.");
      }),
  );
  global.Request = jest.fn().mockImplementation(() => ({ method, url }));
};

const mockFetchClientError = ({
  url,
  status = STATUS_CODES.HTTP_400_BAD_REQUEST,
  method = HttpMethods.GET,
}: MockFetchOptions) => mockFetchResponse({ json: {}, ok: false, url, method, status });

describe("HTTP Client properly functions", () => {
  const client = new HttpClient({
    NetworkErrorClass: HttpNetworkError,
    processors: { okayResponseProcessor: async response => ({ data: await response.json() }) },
  });

  describe("GET request properly returns", () => {
    const URL = "https://app.txelects.com/api/bills/5/";
    const MOCK = {
      url: URL,
      method: HttpMethods.GET,
      json: {
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      },
    };
    it("properly returns successful response when not strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.get("/api/bills/5");
      expect(result).toStrictEqual({
        response: { data: { id: "5", name: "Bill A", description: "Bill Description" } },
        meta: {
          method: HttpMethods.GET,
          url: "https://app.txelects.com/api/bills/5/",
          status: 200,
        },
      });
    });
    it("properly returns successful raw response when not strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const { response } = await client.get("/api/bills/5/", {}, { processed: false });
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns successful response when strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.get("/api/bills/5", {}, { strict: true });
      expect(result).toStrictEqual({
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      });
    });
    it("properly returns successful raw response when strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const response = await client.get("/api/bills/", {}, { processed: false, strict: true });
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns a network error when not strict", async () => {
      mockFetchNetworkError(MOCK);
      const { error } = await client.get("/api/bills/5", {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toEqual(HttpMethods.GET);
      expect(error?.message).toEqual(
        "[GET] There was a network error making a request to " +
          "https://app.txelects.com/api/bills/5/: Error: The request failed.",
      );
    });
    it("properly returns a client error when not strict", async () => {
      mockFetchClientError(MOCK);
      const { error } = await client.get("/api/bills/5", {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toEqual(HttpMethods.GET);
      expect(error?.message).toEqual(
        "[GET] [400] There was a client error making a request to " +
          "https://app.txelects.com/api/bills/5/.",
      );
    });
    it("properly throws a network error when strict", async () => {
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.get("/api/bills/5", {}, { strict: true });
      expect(fn).rejects.toThrow(HttpNetworkError);
    });
    it("properly throws a client error when strict", async () => {
      mockFetchClientError(MOCK);
      const fn = async () => await client.get("/api/bills/5", {}, { strict: true });
      expect(fn).rejects.toThrow(HttpClientError);
    });
  });

  describe("POST request properly returns", () => {
    const URL = "https://app.txelects.com/api/bills/";
    const MOCK = {
      url: URL,
      method: HttpMethods.POST,
      json: {
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      },
    };

    it("properly returns successful response when not strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.post("/api/bills/", { name: "Bill A" });
      expect(result).toStrictEqual({
        response: { data: { id: "5", name: "Bill A", description: "Bill Description" } },
        meta: { method: HttpMethods.POST, url: "https://app.txelects.com/api/bills/", status: 200 },
      });
    });
    it("properly returns successful raw response when not strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const { response } = await client.post(
        "/api/bills/",
        { name: "Bill A" },
        { processed: false },
      );
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns successful response when strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.post("/api/bills/", { name: "Bill A" }, { strict: true });
      expect(result).toStrictEqual({
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      });
    });
    it("properly returns successful raw response when strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const response = await client.post(
        "/api/bills/",
        { name: "Bill A" },
        { processed: false, strict: true },
      );
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns a network error when not strict", async () => {
      mockFetchNetworkError(MOCK);
      const { error } = await client.post("/api/bills/", {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toEqual(HttpMethods.POST);
      expect(error?.message).toEqual(
        "[POST] There was a network error making a request to " +
          "https://app.txelects.com/api/bills/: Error: The request failed.",
      );
    });
    it("properly returns a client error when not strict", async () => {
      mockFetchClientError(MOCK);
      const { error } = await client.post("/api/bills/5", {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toEqual(HttpMethods.POST);
      expect(error?.message).toEqual(
        "[POST] [400] There was a client error making a request to " +
          "https://app.txelects.com/api/bills/.",
      );
    });
    it("properly throws a network error when strict", async () => {
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.post("/api/bills/", {}, { strict: true });
      expect(fn).rejects.toThrow(HttpNetworkError);
    });
    it("properly throws a client error when strict", async () => {
      mockFetchClientError(MOCK);
      const fn = async () => await client.post("/api/bills", {}, { strict: true });
      expect(fn).rejects.toThrow(HttpClientError);
    });
  });

  describe("PATCH request properly returns", () => {
    const URL = "https://app.txelects.com/api/bills/5/";
    const MOCK = {
      url: URL,
      method: HttpMethods.PATCH,
      json: {
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      },
    };
    it("properly returns successful response when not strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.patch("/api/bills/5/", { name: "Bill A" });
      expect(result).toStrictEqual({
        response: { data: { id: "5", name: "Bill A", description: "Bill Description" } },
        meta: {
          method: HttpMethods.PATCH,
          url: "https://app.txelects.com/api/bills/5/",
          status: 200,
        },
      });
    });
    it("properly returns successful raw response when not strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const { response } = await client.patch(
        "/api/bills/5/",
        { name: "Bill A" },
        { processed: false },
      );
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns successful response when strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.patch("/api/bills/5/", { name: "Bill A" }, { strict: true });
      expect(result).toStrictEqual({
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      });
    });
    it("properly returns successful raw response when strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const response = await client.patch(
        "/api/bills/5/",
        { name: "Bill A" },
        { processed: false, strict: true },
      );
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns a network error when not strict", async () => {
      mockFetchNetworkError(MOCK);
      const { error } = await client.patch("/api/bills/5", {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toEqual(HttpMethods.PATCH);
      expect(error?.message).toEqual(
        "[PATCH] There was a network error making a request to " +
          "https://app.txelects.com/api/bills/5/: Error: The request failed.",
      );
    });
    it("properly returns a client error when not strict", async () => {
      mockFetchClientError(MOCK);
      const { error } = await client.patch("/api/bills/5", {}, { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toEqual(HttpMethods.PATCH);
      expect(error?.message).toEqual(
        "[PATCH] [400] There was a client error making a request to " +
          "https://app.txelects.com/api/bills/5/.",
      );
    });
    it("properly throws a network error when strict", async () => {
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.patch("/api/bills/5", {}, { strict: true });
      expect(fn).rejects.toThrow(HttpNetworkError);
    });
    it("properly throws a client error when strict", async () => {
      mockFetchClientError(MOCK);
      const fn = async () => await client.patch("/api/bills/5", {}, { strict: true });
      expect(fn).rejects.toThrow(HttpClientError);
    });
  });

  describe("DELETE request properly returns", () => {
    const URL = "https://app.txelects.com/api/bills/5/";
    const MOCK = {
      url: URL,
      method: HttpMethods.DELETE,
      json: {
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      },
    };

    it("properly returns successful response when not strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.delete("/api/bills/5/", { processed: true });
      expect(result).toStrictEqual({
        response: { data: { id: "5", name: "Bill A", description: "Bill Description" } },
        meta: {
          method: HttpMethods.DELETE,
          url: "https://app.txelects.com/api/bills/5/",
          status: 200,
        },
      });
    });
    it("properly returns successful raw response when not strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const { response } = await client.delete("/api/bills/5/");
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns successful response when strict", async () => {
      mockFetchResponse(MOCK);
      const result = await client.delete("/api/bills/5/", { strict: true, processed: true });
      expect(result).toStrictEqual({
        data: { id: "5", name: "Bill A", description: "Bill Description" },
      });
    });
    it("properly returns successful raw response when strict", async () => {
      mockFetchResponse(MOCK);
      // Here, the response is the raw Response object.
      const response = await client.delete("/api/bills/5/", { strict: true });
      expect(response).toBeDefined();
      expect(response?.url).toBe(URL);
    });
    it("properly returns a network error when not strict", async () => {
      mockFetchNetworkError(MOCK);
      const { error } = await client.delete("/api/bills/5", { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpNetworkError);
      expect(error?.method).toEqual(HttpMethods.DELETE);
      expect(error?.message).toEqual(
        "[DELETE] There was a network error making a request to " +
          "https://app.txelects.com/api/bills/5/: Error: The request failed.",
      );
    });
    it("properly returns a client error when not strict", async () => {
      mockFetchClientError(MOCK);
      const { error } = await client.delete("/api/bills/5", { strict: false });
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error?.method).toEqual(HttpMethods.DELETE);
      expect(error?.message).toEqual(
        "[DELETE] [400] There was a client error making a request to " +
          "https://app.txelects.com/api/bills/5/.",
      );
    });
    it("properly throws a network error when strict", async () => {
      mockFetchNetworkError(MOCK);
      const fn = async () => await client.delete("/api/bills/5", { strict: true });
      expect(fn).rejects.toThrow(HttpNetworkError);
    });
    it("properly throws a client error when strict", async () => {
      mockFetchClientError(MOCK);
      const fn = async () => await client.delete("/api/bills/5", { strict: true });
      expect(fn).rejects.toThrow(HttpClientError);
    });
  });
});

import { addQueryParamsToUrl, getQueryParams } from "~/integrations/http";

const MOCK_QUERY = {
  a: "bar",
  b: 1,
  c: true,
  d: null,
  e: undefined,
  f: "",
  g: "  ",
  h: {
    a: "bar",
    b: 1,
    c: true,
    d: null,
    e: undefined,
    f: "",
    g: "  ",
    h: ["apple", "banana", "pear"],
    i: [],
    k: ["", "  ", "blueberry"],
  },
  i: ["apple", "banana", "pear"],
  j: [],
  k: [" ", "", null],
  l: ["", "  ", "blueberry"],
};

describe("getQueryParams() properly returns", () => {
  it("properly returns query parameters on URL", () => {
    const params = getQueryParams("http://example.com?foo=bar&bar=foo");
    expect(params).toStrictEqual({
      foo: "bar",
      bar: "foo",
    });
  });
  it("properly returns query parameters on path", () => {
    const params = getQueryParams("/api?foo=bar&bar=foo");
    expect(params).toStrictEqual({
      foo: "bar",
      bar: "foo",
    });
  });
});

describe("addQueryParamsToUrl() properly returns", () => {
  it("properly parses and includes query paramters", () => {
    const url = addQueryParamsToUrl("http://example.com", MOCK_QUERY);
    expect(getQueryParams(url)).toStrictEqual({
      a: "bar",
      b: "1",
      c: "true",
      d: "",
      f: "",
      g: "  ",
      h: {
        a: "bar",
        b: "1",
        c: "true",
        d: "",
        f: "",
        g: "  ",
        h: ["apple", "banana", "pear"],
        k: ["", "  ", "blueberry"],
      },
      i: ["apple", "banana", "pear"],
      k: [" ", "", ""],
      l: ["", "  ", "blueberry"],
    });
  });
  it("prooperly parses and includes pruned query paramters", () => {
    const url = addQueryParamsToUrl("http://example.com", MOCK_QUERY);
    expect(getQueryParams(url)).toStrictEqual({
      a: "bar",
      b: "1",
      c: "true",
      h: {
        a: "bar",
        b: "1",
        c: "true",
        h: ["apple", "banana", "pear"],
        k: ["blueberry"],
      },
      i: ["apple", "banana", "pear"],
      l: ["blueberry"],
    });
  });
});

import { encodeQueryParams, decodeQueryParams } from "~/lib/urls";

describe("encodeQueryParams", () => {
  it("properly returns", () => {
    const result = encodeQueryParams({ foo: "bar", array: ["a", "b", "c"] });
    expect(result).toEqual("foo=bar&array%5B0%5D=a&array%5B1%5D=b&array%5B2%5D=c");
    expect(decodeQueryParams(result)).toEqual({
      foo: "bar",
      array: ["a", "b", "c"],
    });
  });
});

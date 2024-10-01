import { screenSizeIsInRange } from "~/components/types";

describe("screnSizeIsInRange()", () => {
  it("properly returns when size is in between breakpoints", () => {
    const result = screenSizeIsInRange("md", "sm:lg");
    expect(result).toEqual(true);
  });
  it("properly returns when size is in between quantitative sizes", () => {
    const result = screenSizeIsInRange("md", "100px:1000px");
    expect(result).toEqual(true);
  });
  it("properly returns when size is a number in between quantitative sizes", () => {
    const result = screenSizeIsInRange(500, "100px:1000px");
    expect(result).toEqual(true);
  });
  it("properly returns when size is in between numbers", () => {
    const result = screenSizeIsInRange("md", "100:1000");
    expect(result).toEqual(true);
  });
  it("properly returns when upper bound is infinite", () => {
    const result = screenSizeIsInRange("md", "sm:inf");
    expect(result).toEqual(true);
  });
  it("properly returns when lower bound is 0", () => {
    const result = screenSizeIsInRange("md", "0:lg");
    expect(result).toEqual(true);
  });
});

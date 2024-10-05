import { parseDataAttributes } from "~/components/types";

type Case = [Record<string, string | boolean | undefined>, Record<string, true | string>];

const Cases: Case[] = [
  [
    { isLoading: true, isDisabled: false, isHidden: true, variant: "", size: " ", radius: "lg" },
    { "data-attr-loading": true, "data-attr-hidden": true, "data-attr-radius": "lg" },
  ],
  [
    { loading: true, disabled: false, hidden: true, isReadOnly: true },
    { "data-attr-loading": true, "data-attr-hidden": true, "data-attr-read-only": true },
  ],
  [{}, {}],
  [{ loading: false, isDisabled: false, hidden: false }, {}],
];

describe("parseDataAttributes()", () => {
  describe("parseDataAttributes() properly returns data attributes", () => {
    test.each(Cases)("(input = %s)", (input, expected) => {
      expect(parseDataAttributes(input)).toEqual(expected);
    });
  });
  it("toDataAttributes() properly throws an error for invalid attributes", () => {
    expect(() => parseDataAttributes({ is9Loading: true })).toThrow(TypeError);
  });
});

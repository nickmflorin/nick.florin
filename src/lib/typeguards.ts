import { z } from "zod";

type AssertDefined = <V>(value: V | undefined) => asserts value is V;

export const assertDefined: AssertDefined = <V>(value: V | undefined): asserts value is V => {
  if (value === undefined) {
    throw new TypeError("Unexpectedly encountered undefined value!");
  }
};

export const ensuresDefinedValue = <V>(value: V | undefined): V => {
  assertDefined(value);
  return value;
};

export const isUuid = (value: unknown): value is string =>
  z.string().uuid().safeParse(value).success;

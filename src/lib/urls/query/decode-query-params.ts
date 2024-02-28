import { z } from "zod";

import {
  type QueryParams,
  type EncodedQueryParamValue,
  type QueryParamValue,
  type QueryParamsForm,
} from "./types";
import { searchParamsIterator } from "./util";

type DecodedQueryParamForm = "array" | "string" | "number" | "null" | "boolean";

type DecodedQueryParamType<F extends DecodedQueryParamForm> = {
  array: string[];
  string: string;
  number: number;
  null: null;
  boolean: boolean;
}[F];

const DecodedQueryParamValidators: {
  [key in DecodedQueryParamForm]: (v: unknown) => v is DecodedQueryParamType<key>;
} = {
  array: (v): v is string[] => z.array(z.string()).safeParse(v).success,
  string: (v): v is string => z.string().safeParse(v).success,
  number: (v): v is number => z.coerce.number().safeParse(v).success,
  null: (v): v is null => v === null,
  boolean: (v): v is boolean => z.boolean().safeParse(v).success,
};

type DecodeQueryParamOptions = {
  readonly form?: string[];
};

type DecodeQueryParamReturn<O extends DecodeQueryParamOptions> = O extends {
  readonly form: (infer F extends string)[];
}
  ? F extends DecodedQueryParamForm
    ? DecodedQueryParamType<F> | undefined
    : never
  : Exclude<QueryParamValue, undefined>;

export const decodeQueryParam = <O extends DecodeQueryParamOptions>(
  v: EncodedQueryParamValue,
  opts: O,
): DecodeQueryParamReturn<O> => {
  if (opts.form === undefined) {
    const arrayRegex = /^\[(.)*,?\]$/;
    const numRegex = /^([0-9]|\.)*$/;
    if (
      arrayRegex.test(v.trim()) ||
      numRegex.test(v.trim()) ||
      ["null", "true", "false"].includes(v.trim())
    ) {
      return JSON.parse(v.trim());
    }
    return v as DecodeQueryParamReturn<O>;
  }
  const decoded = decodeQueryParam(v, {});
  for (const f of opts.form) {
    if (!Object.keys(DecodedQueryParamValidators).includes(f)) {
      throw new TypeError(`The value '${f}' is not a valid query param form!`);
    }
    if (DecodedQueryParamValidators[f as DecodedQueryParamForm](decoded)) {
      return decoded as DecodeQueryParamReturn<O>;
    }
  }
  return undefined as unknown as DecodeQueryParamReturn<O>;
};

export const decodeQueryParams = (
  params: QueryParams<QueryParamsForm, EncodedQueryParamValue>,
): QueryParams<"record", QueryParamValue> => {
  const decoded: QueryParams<"record", QueryParamValue> = {};
  for (const [k, v] of searchParamsIterator(params)) {
    decoded[k] = decodeQueryParam(v, {});
  }
  return decoded;
};

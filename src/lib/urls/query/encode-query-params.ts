import qs from "qs";

import type * as types from "./types";

import { transformQueryParams } from "~/lib/urls";

export const encodeQueryParams = (obj: types.QueryParams): string => {
  const params = transformQueryParams(obj, { form: "record" });
  return qs.stringify(params, { allowEmptyArrays: true });
};

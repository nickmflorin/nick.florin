import { type NextRequest } from "next/server";

import { decodeQueryParam, encodeQueryParam } from "~/lib/urls";
import { type Includes } from "~/prisma/model";

export const encodeInclusionQuery = <I extends Includes>(includes: I): string => {
  const positives = Object.keys(includes).reduce(
    (prev: string[], curr: string) => (includes[curr as keyof I] === true ? [...prev, curr] : prev),
    [],
  );
  return encodeQueryParam(positives);
};

export const decodeInclusionQuery = <F extends string>(
  fields: F[],
  param: string | undefined | null,
): Includes<F> => {
  if (param) {
    const parsed = decodeQueryParam(param, {});
    if (Array.isArray(parsed)) {
      const includedFields = parsed.filter((p): p is F => fields.includes(String(p) as F));
      return includedFields.reduce((prev, curr) => ({ ...prev, [curr]: true }), {} as Includes<F>);
    }
  }
  return {};
};

export const parseInclusion = <F extends string>(
  request: NextRequest,
  fields: F[],
): Includes<F> => {
  const params = request.nextUrl.searchParams;
  const v = params.get("includes");
  return decodeInclusionQuery(fields, v);
};

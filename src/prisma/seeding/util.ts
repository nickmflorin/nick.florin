import uniq from "lodash.uniq";

import { humanizeList } from "~/lib/formatters";

const modelStringValueStandardizer = (name: string) => name.toLowerCase().replaceAll(" ", "");
const modelStringValueComparator = (name1: string, name2: string) =>
  modelStringValueStandardizer(name1) === modelStringValueStandardizer(name2);

type StringRequiredKeys<M extends Record<string, unknown>> = keyof {
  [key in keyof M as [M[key]] extends [string] ? key : never]: M[key];
};

type FindCorrespondingFieldOptions<
  M extends Record<string, unknown>,
  J extends Record<string, unknown>,
> = {
  readonly strict?: boolean;
  readonly field: StringRequiredKeys<M | J>;
  readonly reference: string;
  readonly comparator?: never;
  readonly getModelComparisonValue?: never;
  readonly getJsonComparisonValue?: never;
};

type FindCorrespondingGetterOptions<
  M extends Record<string, unknown>,
  J extends Record<string, unknown>,
> = {
  readonly strict?: boolean;
  readonly field?: never;
  readonly reference: string;
  readonly comparator?: never;
  readonly getJsonComparisonValue: (m: J) => string;
  readonly getModelComparisonValue: (m: M) => string;
};

type FindCorrespondingComparatorOptions<
  M extends Record<string, unknown>,
  J extends Record<string, unknown>,
> = {
  readonly strict?: boolean;
  readonly reference: string;
  readonly field?: never;
  readonly getModelComparisonValue?: never;
  readonly getJsonComparisonValue?: never;
  readonly comparator: (model: M, json: J) => boolean;
};

type FindCorrespondingOptions<
  M extends Record<string, unknown>,
  J extends Record<string, unknown>,
> =
  | FindCorrespondingComparatorOptions<M, J>
  | FindCorrespondingFieldOptions<M, J>
  | FindCorrespondingGetterOptions<M, J>;

export function getModelValue<P extends Record<string, unknown>>(
  m: P,
  getter: StringRequiredKeys<P> | ((m: P) => string),
): string {
  if (typeof getter === "string") {
    const v = m[getter as keyof P];
    if (typeof v !== "string") {
      throw new Error(
        `Invalid comparator field, '${String(
          getter,
        )}'!  The field does not correspond to string values on the model or json fixture, ` +
          `but rather a value of type '${typeof v}'. `,
      );
    }
    return v;
  }
  const v = (getter as (m: P) => string)(m);
  if (typeof v !== "string") {
    throw new Error(
      "Invalid getter!  The getter did not return a string value on the model or json " +
        "fixture object.",
    );
  }
  return v;
}

type FindCorrespondingRT<
  M extends Record<string, unknown>,
  J extends Record<string, unknown>,
  O extends FindCorrespondingOptions<M, J>,
> = O extends { strict: true } ? M : M | null;

export const findCorresponding = <
  M extends Record<string, unknown>,
  J extends Record<string, unknown>,
  O extends FindCorrespondingOptions<M, J>,
>(
  models: M[],
  json: J,
  { comparator, reference, field, strict, getModelComparisonValue, getJsonComparisonValue }: O,
): FindCorrespondingRT<M, J, O> => {
  const throwErr = (msg: string, data?: { [key in string]: string }): never => {
    const d: Record<string, string> = field
      ? { ...data, reference, field: String(field) }
      : { ...data, reference };
    const dataStrings = Object.keys(d).reduce(
      (prev: string[], k: string) => [...prev, `${k} = '${d[k]}'`],
      [],
    );
    throw new Error(`[${dataStrings.join(", ")}] ${msg}`);
  };

  function _getValue(m: M | J, isJson?: boolean): string {
    if (field) {
      return getModelValue(m, field);
    } else if (getModelComparisonValue !== undefined && getJsonComparisonValue !== undefined) {
      return getModelValue(
        m,
        (isJson ? getJsonComparisonValue : getModelComparisonValue) as (m: M | J) => string,
      );
    }
    return throwErr(
      "Invalid function implementation!  If the 'comparator' is not provided, either the 'field' " +
        "option must be provided or both the 'getModelComparisonValue' and " +
        "'getJsonComparisonValue' options must be provided.",
    );
  }

  let compareFn: (model: M, json: J) => boolean;
  if (comparator) {
    compareFn = comparator;
  } else {
    compareFn = (model, json) =>
      modelStringValueComparator(_getValue(model), _getValue(json, true));
  }

  const filtered = models.filter(m => compareFn(m, json));
  if (filtered.length === 0) {
    if (strict) {
      return throwErr(
        `The provided ${reference} could not be found in the set of provided models`,
        { jsonValue: _getValue(json, true) },
      );
    }
    return null as FindCorrespondingRT<M, J, O>;
  } else if (filtered.length > 1) {
    if (comparator) {
      return throwErr(
        `The provided comparator returned true for ${filtered.length} existing models in the ` +
          "database.  The comparator must uniquely identify a model.",
        { jsonValue: _getValue(json, true) },
      );
    }
    const uniqValues = uniq(filtered.map(m => _getValue(m)));
    if (uniqValues.length === 1) {
      throw new Error(
        `The JSON fixture model value, '${_getValue(json)}', maps to ${filtered.length} existing ` +
          "models in the database.  Each model in the database has the same existing " +
          `value, '${uniqValues[0]}'.`,
      );
    }
    const humanized = humanizeList(uniqValues, { conjunction: "and", formatter: v => `'${v}'` });
    throw new Error(
      `The JSON fixture model value, '${_getValue(json)}', maps to ${filtered.length} existing ` +
        "models in the database.  The models in the database have the following values: " +
        `${humanized}.`,
    );
  }
  return filtered[0];
};

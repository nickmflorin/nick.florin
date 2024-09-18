import { uniq } from "lodash-es";

import { humanizeList } from "~/lib/formatters";

class ModelLookupError extends Error {
  constructor(msg: string, reference: string, data?: Record<string, unknown>) {
    const d: Record<string, unknown> = { ...data, reference };
    const dataStrings = Object.keys(d).reduce(
      (prev: string[], k: string) => (d[k] !== undefined ? [...prev, `${k} = '${d[k]}'`] : prev),
      [],
    );
    super(`[${dataStrings.join(", ")}] ${msg}`);
  }
}

const modelStringValueStandardizer = (name: string) => name.toLowerCase().replaceAll(" ", "");
const modelStringValueComparator = (name1: string, name2: string) =>
  modelStringValueStandardizer(name1) === modelStringValueStandardizer(name2);

type Model = Record<string, unknown>;
type Json = Record<string, unknown>;

type StringRequiredKeys<M extends Model> = keyof {
  [key in keyof M as [M[key]] extends [string] ? key : never]: M[key];
};

type FindCorrespondingFieldOptions<M extends Model, J extends Json> = {
  readonly strict?: boolean;
  readonly field: StringRequiredKeys<M | J> | StringRequiredKeys<M | J>[];
  readonly reference: string;
  readonly comparator?: never;
};

type FindCorrespondingComparatorOptions<M extends Model, J extends Json> = {
  readonly strict?: boolean;
  readonly reference: string;
  readonly field?: never;
  readonly comparator: (model: M, json: J) => boolean;
};

type FindCorrespondingOptions<M extends Model, J extends Json> =
  | FindCorrespondingComparatorOptions<M, J>
  | FindCorrespondingFieldOptions<M, J>;

export function getModelValue<P extends Record<string, unknown>>(
  m: P,
  getter: StringRequiredKeys<P>,
  reference: string,
): string {
  const v = m[getter as keyof P];
  if (typeof v !== "string") {
    throw new ModelLookupError(
      `Invalid comparator field, '${String(
        getter,
      )}'!  The field does not correspond to string values on the model or json fixture, ` +
        `but rather a value of type '${typeof v}'. `,
      reference,
    );
  }
  return v;
}

type FindCorrespondingSingleRT<
  M extends Model,
  J extends Json,
  O extends FindCorrespondingOptions<M, J>,
> = O extends { strict: true } ? M : M | null;

const findSingleCorresponding = <
  M extends Model,
  J extends Json,
  O extends FindCorrespondingOptions<M, J>,
>(
  models: M[],
  json: J,
  options: O,
): FindCorrespondingSingleRT<M, J, O> => {
  if (Array.isArray(options.field)) {
    for (let i = 0; i < options.field.length - 1; i++) {
      const field = options.field[i];
      const corresponding = findSingleCorresponding(models, json, {
        ...options,
        field,
        strict: false,
      });
      if (corresponding) {
        return corresponding;
      }
    }
    return findSingleCorresponding(models, json, {
      ...options,
      field: options.field[options.field.length - 1],
    });
  }

  const { comparator, reference, field: _field, strict = false } = options;

  const field = _field as StringRequiredKeys<M | J> | undefined;

  function _getValue(m: M | J): string {
    if (field) {
      return getModelValue(m, field, reference);
    }
    throw new ModelLookupError(
      "Invalid function implementation:  If the 'field' is not provided, the 'comparator' " +
        "option must be specified.",
      reference,
    );
  }

  let compareFn: (model: M, json: J) => boolean;
  if (comparator) {
    compareFn = comparator;
  } else {
    compareFn = (model, json) => modelStringValueComparator(_getValue(model), _getValue(json));
  }

  const filtered = models.filter(m => compareFn(m, json));
  if (filtered.length === 0) {
    if (strict) {
      throw new ModelLookupError(
        `The provided ${reference} could not be found in the set of provided models`,
        reference,
        { jsonValue: _getValue(json), field },
      );
    }
    return null as FindCorrespondingSingleRT<M, J, O>;
  } else if (filtered.length > 1) {
    if (comparator) {
      throw new ModelLookupError(
        `The provided comparator returned true for ${filtered.length} existing models in the ` +
          "database.  The comparator must uniquely identify a model.",
        reference,
        { jsonValue: _getValue(json), field },
      );
    }
    const uniqValues = uniq(filtered.map(m => _getValue(m)));
    if (uniqValues.length === 1) {
      throw new ModelLookupError(
        `The JSON fixture model value, '${_getValue(json)}', maps to ${filtered.length} existing ` +
          "models in the database.  Each model in the database has the same existing " +
          `value, '${uniqValues[0]}'.`,
        reference,
        { field },
      );
    }
    const humanized = humanizeList(uniqValues, { conjunction: "and", formatter: v => `'${v}'` });
    throw new ModelLookupError(
      `The JSON fixture model value, '${_getValue(json)}', maps to ${filtered.length} existing ` +
        "models in the database.  The models in the database have the following values: " +
        `${humanized}.`,
      reference,
      { field },
    );
  }
  return filtered[0];
};

type FindCorrespondingMultiRT<
  M extends Model,
  J extends Json,
  O extends FindCorrespondingOptions<M, J>,
> = O extends { strict: true } ? M[] : (M | null)[];

export function findCorresponding<
  M extends Model,
  J extends Json,
  O extends FindCorrespondingOptions<M, J>,
>(models: M[], json: J, options: O): FindCorrespondingSingleRT<M, J, O>;

export function findCorresponding<
  M extends Model,
  J extends Json,
  O extends FindCorrespondingOptions<M, J>,
>(models: M[], json: J[], options: O): FindCorrespondingMultiRT<M, J, O>;

export function findCorresponding<
  M extends Model,
  J extends Json,
  O extends FindCorrespondingOptions<M, J>,
>(models: M[], json: J | J[], options: O) {
  if (Array.isArray(json)) {
    return json.map(j => findSingleCorresponding<M, J, O>(models, j, options));
  }
  return findSingleCorresponding(models, json, options);
}

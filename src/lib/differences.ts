import isEqual from "lodash.isequal";

export type DifferingField<
  M extends Record<string, unknown>,
  Mi extends Record<string, unknown>,
  F extends keyof M & keyof Mi,
> = {
  readonly field: F;
  readonly previousValue?: M[F];
  readonly newValue?: Mi[F];
};

export const differingFields = <
  M extends Record<string, unknown>,
  Mi extends Record<string, unknown>,
  F extends keyof M & keyof Mi,
>(
  existing: M,
  additional: Mi,
  fields: F[],
): DifferingField<M, Mi, F>[] =>
  fields.reduce(
    (acc: DifferingField<M, Mi, F>[], field: F): DifferingField<M, Mi, F>[] => {
      if (!isEqual(existing[field], additional[field])) {
        return [...acc, { field, previousValue: existing[field], newValue: additional[field] }];
      }
      return acc;
    },
    [] as DifferingField<M, Mi, F>[],
  );

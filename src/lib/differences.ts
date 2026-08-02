import { isEqual } from 'lodash-es';

export type DifferingField<
  M extends Record<string, unknown>,
  Mi extends Record<string, unknown>,
  F extends keyof M & keyof Mi,
> = {
  readonly field: F;
  readonly newValue?: Mi[F];
  readonly previousValue?: M[F];
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
        return [...acc, { field, newValue: additional[field], previousValue: existing[field] }];
      }
      return acc;
    },
    [] as DifferingField<M, Mi, F>[],
  );

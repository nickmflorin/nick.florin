export const constructOrSearch = (query: string | undefined, fields: string[]) => ({
  OR:
    query !== undefined && query.length !== 0
      ? fields.map(field => ({ [field]: { contains: query, mode: "insensitive" as const } }))
      : undefined,
});

export const conditionalFilters = <T>(filters: T[]): NonNullable<T>[] =>
  filters.filter(f => f !== undefined) as NonNullable<T>[];

type ConditionalAndClauseObj<
  B extends boolean = boolean,
  C extends Record<string, unknown> = Record<string, unknown>,
> = {
  clause: C;
  condition: B;
};

type ConditionalAndClauseConditional<C extends Record<string, unknown> = Record<string, unknown>> =
  C | null;

const isConditionalAndClauseObj = <C extends Record<string, unknown>>(
  clause: ConditionalAndClauseObj<boolean, C> | ConditionalAndClauseConditional<C>,
): clause is ConditionalAndClauseObj<boolean, C> =>
  Boolean(
    clause &&
      "condition" in clause &&
      (clause as ConditionalAndClauseObj<boolean, C>).condition !== undefined &&
      typeof (clause as ConditionalAndClauseObj<boolean, C>).condition === "boolean",
  );

type InferConditionalAndClause<
  T extends (Record<string, unknown> | null | ConditionalAndClauseObj)[],
> = T extends (infer Ti extends Record<string, unknown> | null | ConditionalAndClauseObj)[]
  ? Ti extends { clause: infer Ci extends Record<string, unknown> }
    ? Ci
    : Ti extends Record<string, unknown>
      ? Ti
      : never
  : never;

export const conditionalAndClause = <
  T extends (ConditionalAndClauseObj | Record<string, unknown> | null)[],
>(
  clauses: T,
): { AND: InferConditionalAndClause<T>[] } => ({
  AND: clauses.reduce(
    (prev: InferConditionalAndClause<T>[], c) =>
      isConditionalAndClauseObj(c)
        ? c.condition
          ? [...prev, c.clause as InferConditionalAndClause<T>]
          : prev
        : c !== null
          ? [...prev, c as InferConditionalAndClause<T>]
          : prev,
    [] as InferConditionalAndClause<T>[],
  ),
});

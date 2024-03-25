export const constructOrSearch = (query: string | undefined, fields: string[]) => ({
  OR:
    query !== undefined && query.length !== 0
      ? fields.map(field => ({ [field]: { contains: query, mode: "insensitive" as const } }))
      : undefined,
});

export const conditionalFilters = <T>(filters: T[]): NonNullable<T>[] =>
  filters.filter(f => f !== undefined) as NonNullable<T>[];

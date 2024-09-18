import type * as types from "~/components/tables-v2/types";

export const getDatumId = <D extends types.DataTableDatum>(
  datum: D,
  options: { index: number; getRowId?: (datum: D) => string },
): string => {
  if (options.getRowId) {
    return options.getRowId(datum);
  } else if (datum.id) {
    return datum.id;
  }
  return `row-${options.index}`;
};

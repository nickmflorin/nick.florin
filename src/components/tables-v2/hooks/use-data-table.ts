import { useContext } from "react";

import { DataTableContext } from "~/components/tables-v2/context";
import type {
  DataTableColumnConfig,
  DataTableDatum,
  DataTableInstance,
} from "~/components/tables-v2/types";

export const useDataTable = <
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D> = DataTableColumnConfig<D>,
>() => {
  const ctx = useContext(DataTableContext);
  if (!ctx.isInScope) {
    throw new Error("The 'useDataTable' hook must be called within the 'DataTableProvider'!");
  }
  /* This is not ideal - and could lead to improper typing if the DataTableProvider is used for
     a table that is typed differently than the provider itself.  However, that would be an
     obvious developer error, so while not ideal, the type coercion here is not the end of the
     world. */
  return ctx as DataTableInstance<D, C>;
};

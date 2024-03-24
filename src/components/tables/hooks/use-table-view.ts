import { useContext } from "react";

import { TableViewContext } from "../Context";
import { type TableModel, type TableView } from "../types";

export const useTableView = <T extends TableModel>() => {
  const ctx = useContext(TableViewContext);
  if (!ctx.isReady) {
    throw new Error("The 'useTableView' hook must be called within the 'TableViewProvider'!");
  }
  /* This coercion is not ideal, but its the only way that allows us to work with the generic types
     on the context. */
  return ctx as unknown as TableView<T>;
};

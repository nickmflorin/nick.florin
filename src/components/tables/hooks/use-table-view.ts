import { useContext } from "react";

import { TableViewContext } from "../Context";

export const useTableView = () => {
  const ctx = useContext(TableViewContext);
  if (!ctx.ready) {
    throw new Error("The 'useTableView' hook must be called within the 'TableViewProvider'!");
  }
  return ctx;
};

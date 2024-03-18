import { createContext } from "react";

import { type TableView, type TableModel } from "./types";

export const TableViewContext = createContext<TableView<TableModel>>({
  ready: false,
  id: "",
  isCheckable: false,
  checked: [],
  check: () => {},
  uncheck: () => {},
});

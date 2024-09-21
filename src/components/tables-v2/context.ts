import { createContext } from "react";

import { type DataTableInstance, type HideableTableColumn } from "./types";

/* The any types here are not ideal - but it is the only workaround for the generically typed
   DataTableProvider (unfortunately). */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const DataTableContext = createContext<DataTableInstance<any, any>>({
  isInScope: false,
  selectedRows: [],
  rowsAreSelectable: false,
  rowsHaveActions: false,
  rowsAreDeletable: false,
  columns: [],
  orderableColumns: [],
  hideableColumns: [],
  visibleColumns: [],
  controlBarTargetId: null,
  setVisibleColumns: () => {},
  hideColumn: () => {},
  showColumn: () => {},
  rowIsLoading: () => false,
  rowIsLocked: () => false,
  rowIsSelected: () => false,
  syncSelectedRows: () => {},
  setSelectedRows: () => {},
  selectRows: () => {},
  deselectRows: () => {},
  toggleRowSelection: () => {},
  changeRowSelection: () => {},
  setRowLoading: () => {},
  columnIsHidden: () => false,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  columnIsHideable: (id: string): id is HideableTableColumn<any> => false,
  columnIsVisible: () => false,
  toggleColumnVisibility: () => {},
});

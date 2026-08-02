import { createContext } from 'react';

import { type DataTableInstance, type HideableTableColumn } from './types';

/* eslint-disable-next-line @typescript-eslint/no-empty-function -- Every method of the default
   context value has to be a no-op until a provider replaces it. */
const noop = () => {};

/* The any types here are not ideal - but it is the only workaround for the generically typed
   DataTableProvider (unfortunately). */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const DataTableContext = createContext<DataTableInstance<any, any>>({
  canToggleColumnVisibility: false,
  changeRowSelection: noop,
  columnIsHidden: () => false,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  columnIsHideable: (_id: string): _id is HideableTableColumn<any> => false,
  columnIsVisible: () => false,
  columns: [],
  controlBarTargetId: null,
  deselectRows: noop,
  hideableColumns: [],
  hideColumn: noop,
  isInScope: false,
  orderableColumns: [],
  rowIsLoading: () => false,
  rowIsLocked: () => false,
  rowIsSelected: () => false,
  rowsAreDeletable: false,
  rowsAreSelectable: false,
  rowsHaveActions: false,
  selectedRows: [],
  selectRows: noop,
  setRowLoading: noop,
  setSelectedRows: noop,
  setVisibleColumns: noop,
  showColumn: noop,
  syncSelectedRows: noop,
  toggleColumnVisibility: noop,
  toggleRowSelection: noop,
  visibleColumns: [],
});

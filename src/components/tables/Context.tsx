import {
  createContext,
  type ReactNode,
  type WeakValidationMap,
  type ConsumerProps,
  type ProviderProps,
} from "react";

import { type TableView, type TableModel } from "./types";

// Overridden from React's internals to allow for generically typed context.
interface ProviderExoticComponent {
  <T extends TableModel>(props: ProviderProps<TableView<T>>): ReactNode;
  readonly $$typeof: symbol;
  propTypes?: WeakValidationMap<ProviderProps<TableView<TableModel>>> | undefined;
}

// Overridden from React's internals to allow for generically typed context.
interface ConsumerExoticComponent {
  <T extends TableModel>(props: ConsumerProps<TableView<T>>): ReactNode;
  readonly $$typeof: symbol;
  propTypes?: WeakValidationMap<ProviderProps<TableView<TableModel>>> | undefined;
}

export const TableViewContext = createContext<TableView<TableModel>>({
  isReady: false,
  id: "",
  isCheckable: false,
  canToggleColumnVisibility: false,
  checked: [],
  columns: [],
  visibleColumns: [],
  visibleColumnIds: [],
  hideColumn: () => {},
  showColumn: () => {},
  check: () => {},
  uncheck: () => {},
  setVisibleColumns: () => {},
}) as {
  Provider: ProviderExoticComponent;
  Consumer: ConsumerExoticComponent;
  displayName?: string | undefined;
};

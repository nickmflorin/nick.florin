import type { ReactNode } from "react";

import { type EnumeratedLiteralsMember, enumeratedLiterals } from "enumerated-literals";

import { type ExtractValues } from "~/lib/types";

import { type PopoverRenderProps } from "~/components/floating";
import { type IconProp, type IconName } from "~/components/icons";
import { type MenuItemInstance } from "~/components/menus";
import type { QuantitativeSize, ComponentProps } from "~/components/types";

import { type TableBodyCellProps } from "./generic/TableBodyCell";
import { type TableHeaderCellProps } from "./generic/TableHeaderCell";

export type TableLoadingIndicatorType = "spinner" | "fade-rows" | "skeleton";
export type TableLoadingIndicator = TableLoadingIndicatorType | TableLoadingIndicatorType[];

export const tableHasLoadingIndicator = (
  indicator: TableLoadingIndicator | undefined,
  indicatorType: TableLoadingIndicatorType,
) => (Array.isArray(indicator) ? indicator.includes(indicatorType) : indicator === indicatorType);

export const TableSizes = enumeratedLiterals(["small", "medium", "large"] as const, {});
export type TableSize = EnumeratedLiteralsMember<typeof TableSizes>;

export interface DataTableDatum {
  readonly id: string;
  [key: string]: unknown;
}

export type DataTableRowAction = {
  readonly isVisible?: boolean;
  readonly content: ReactNode;
  readonly loadingText?: string;
  readonly className?: ComponentProps["className"];
  readonly icon?: IconProp | IconName | JSX.Element;
  readonly isLoading?: boolean;
  readonly onClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: MenuItemInstance,
  ) => void;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type DataTableColumnConfig<D extends DataTableDatum = any, I extends string = string> = {
  readonly id: I;
  readonly icon?: IconProp | IconName;
  readonly label?: string;
  readonly isOrderable?: boolean;
  readonly isHideable?: boolean;
  readonly isHiddenByDefault?: boolean;
  readonly columnCellClassName?: ComponentProps["className"];
  readonly headerCellClassName?: ComponentProps["className"];
  readonly bodyCellClassName?: ComponentProps["className"];
  readonly props?: Omit<
    TableHeaderCellProps,
    "children" | "align" | "id" | "icon" | "isOrderable" | "className"
  >;
  readonly align?: TableHeaderCellProps["align"];
  readonly accessor?: Exclude<keyof D, "id">;
  readonly width?: QuantitativeSize<"px">;
  readonly minWidth?: QuantitativeSize<"px">;
  readonly maxWidth?: QuantitativeSize<"px">;
  readonly skeleton?: ReactNode;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface DataTableColumn<D extends DataTableDatum, C extends DataTableColumnConfig<D>> {
  readonly id: C["id"];
  readonly config: C;
  readonly cellProps?: (datum: D) => Omit<TableBodyCellProps, "children">;
  readonly cellRenderer?: (datum: D) => ReactNode;
}

export type DataTableColumnProperties<
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D>,
> = Partial<{
  [key in C["id"]]: Pick<DataTableColumn<D, C>, "cellProps" | "cellRenderer">;
}>;

export const convertConfigsToColumns = <
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D>,
>(
  configs: C[],
  properties: DataTableColumnProperties<D, C>,
): DataTableColumn<D, C>[] =>
  configs.map(
    (config): DataTableColumn<D, C> => ({
      id: config.id,
      config: config,
      cellProps: properties[config.id as C["id"]]?.cellProps,
      cellRenderer: properties[config.id as C["id"]]?.cellRenderer,
    }),
  );

export type TableColumnId<C extends DataTableColumnConfig> = C["id"];

export type OrderableTableColumn<
  C extends DataTableColumnConfig,
  I extends string = string,
> = Extract<C, { isOrderable: true; id: I }>;

export const columnIsOrderable = <C extends DataTableColumnConfig>(
  col: C,
): col is OrderableTableColumn<C> => (col as OrderableTableColumn<C>).isOrderable === true;

export type OrderableTableColumnId<C extends DataTableColumnConfig> = OrderableTableColumn<C>["id"];

export type HideableTableColumn<
  C extends DataTableColumnConfig,
  I extends string = string,
> = Extract<C, { isHideable?: true; id: I }>;

export type DataTableColumns<
  D extends DataTableDatum,
  I extends string = string,
> = DataTableColumnConfig<D, I>[];

export type RowLoadingState = {
  readonly id: string;
  readonly locked?: boolean;
};

export interface DataTableInstance<
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D> = DataTableColumnConfig<D>,
> {
  readonly isInScope: boolean;
  readonly selectedRows: D[];
  readonly rowsHaveActions: boolean;
  readonly rowsAreSelectable: boolean;
  readonly rowsAreDeletable: boolean;
  readonly columns: C[];
  readonly orderableColumns: OrderableTableColumn<C>[];
  readonly hideableColumns: HideableTableColumn<C>[];
  readonly visibleColumns: C[];
  readonly controlBarTargetId: string | null;
  readonly canToggleColumnVisibility: boolean;
  readonly columnIsHideable: (id: string) => id is HideableTableColumn<C>["id"];
  readonly columnIsVisible: (id: string) => boolean;
  readonly columnIsHidden: (id: string) => boolean;
  readonly rowIsLoading: (id: D | string) => boolean;
  readonly rowIsLocked: (id: D | string) => boolean;
  readonly syncSelectedRows: (data: D[]) => void;
  readonly setSelectedRows: (selected: D[]) => void;
  readonly selectRows: (rows: D[] | D) => void;
  readonly deselectRows: (rows: D[] | D | string | string[]) => void;
  readonly changeRowSelection: (row: D, isSelected: boolean) => void;
  readonly toggleRowSelection: (row: D) => void;
  readonly rowIsSelected: (row: D | string) => boolean;
  readonly setRowLoading: (id: string, loading: boolean, opts?: { locked?: boolean }) => void;
  readonly hideColumn: (id: string) => void;
  readonly showColumn: (id: string) => void;
  readonly setVisibleColumns: (m: string[]) => void;
  readonly toggleColumnVisibility: (id: string) => void;
}

export interface CellDataTableInstance<
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D> = DataTableColumnConfig<D>,
> extends Pick<DataTableInstance<D, C>, "setRowLoading"> {}

// Note: This will be updated to conform with the new Filters class.

export type TableFilterWTooltip<
  F extends TableFilters = TableFilters,
  I extends TableFilterId<F> = TableFilterId<F>,
> = {
  readonly id: I;
  readonly placeholder?: string;
  readonly label: string;
  readonly isHiddenByDefault?: boolean;
  readonly isHideable?: boolean;
  readonly tooltipLabel: string | ((value: F[I]) => ReactNode);
  readonly renderer: (value: F[I], params: Partial<PopoverRenderProps>) => JSX.Element;
};

export type TableFilterWoTooltip<
  F extends TableFilters = TableFilters,
  I extends TableFilterId<F> = TableFilterId<F>,
> = {
  readonly id: I;
  readonly placeholder?: string;
  readonly label: string;
  readonly isHiddenByDefault?: boolean;
  readonly tooltipLabel?: never;
  readonly isHideable?: boolean;
  readonly renderer: (value: F[I]) => JSX.Element;
};

export type TableFilter<
  F extends TableFilters = TableFilters,
  I extends TableFilterId<F> = TableFilterId<F>,
> = TableFilterWoTooltip<F, I> | TableFilterWTooltip<F, I>;

export type TableFiltersConfiguration<F extends TableFilters> = ExtractValues<{
  [key in TableFilterId<F>]: TableFilter<F, key>;
}>[];

export type TableFilterConfiguration<
  K extends TableFilterId<F>,
  F extends TableFilters,
> = ExtractValues<{
  [key in K]: TableFilter<F, key>;
}>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type TableFilters = { [key in string]: any };

export type TableFilterId<F extends TableFilters> = keyof F & string;

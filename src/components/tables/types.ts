import { type JSX, type MouseEvent, type ReactNode } from 'react';

import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type ExtractValues } from '~/lib/types';

import { type PopoverRenderProps } from '~/components/floating';
import { type IconName, type IconProp } from '~/components/icons';
import { type MenuItemInstance } from '~/components/menus';
import { type ComponentProps, type QuantitativeSize } from '~/components/types';

import { type TableBodyCellProps } from './generic/TableBodyCell';
import { type TableHeaderCellProps } from './generic/TableHeaderCell';

export type TableLoadingIndicatorType = 'fade-rows' | 'skeleton' | 'spinner';
export type TableLoadingIndicator = TableLoadingIndicatorType | TableLoadingIndicatorType[];

export const tableHasLoadingIndicator = (
  indicator: TableLoadingIndicator | undefined,
  indicatorType: TableLoadingIndicatorType,
) => (Array.isArray(indicator) ? indicator.includes(indicatorType) : indicator === indicatorType);

export const TableSizes = enumeratedLiterals(['small', 'medium', 'large'] as const, {});
export type TableSize = EnumeratedLiteralsMember<typeof TableSizes>;

export interface DataTableDatum {
  [key: string]: unknown;
  readonly id: string;
}

export type DataTableRowAction = {
  readonly className?: ComponentProps['className'];
  readonly content: ReactNode;
  readonly icon?: IconName | IconProp | JSX.Element;
  readonly isLoading?: boolean;
  readonly isVisible?: boolean;
  readonly loadingText?: string;
  readonly onClick: (e: MouseEvent<HTMLDivElement>, instance: MenuItemInstance) => void;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type DataTableColumnConfig<D extends DataTableDatum = any, I extends string = string> = {
  readonly accessor?: Exclude<keyof D, 'id'>;
  readonly align?: TableHeaderCellProps['align'];
  readonly bodyCellClassName?: ComponentProps['className'];
  readonly columnCellClassName?: ComponentProps['className'];
  readonly headerCellClassName?: ComponentProps['className'];
  readonly icon?: IconName | IconProp;
  readonly id: I;
  readonly isHiddenByDefault?: boolean;
  readonly isHideable?: boolean;
  readonly isOrderable?: boolean;
  readonly label?: string;
  readonly maxWidth?: QuantitativeSize<'px'>;
  readonly minWidth?: QuantitativeSize<'px'>;
  readonly props?: Omit<
    TableHeaderCellProps,
    'align' | 'children' | 'className' | 'icon' | 'id' | 'isOrderable'
  >;
  readonly skeleton?: ReactNode;
  readonly width?: QuantitativeSize<'px'>;
};

export interface DataTableColumn<D extends DataTableDatum, C extends DataTableColumnConfig<D>> {
  readonly cellProps?: (datum: D) => Omit<TableBodyCellProps, 'children'>;
  readonly cellRenderer?: (datum: D) => ReactNode;
  readonly config: C;
  readonly id: C['id'];
}

export type DataTableColumnProperties<
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D>,
> = Partial<Record<C['id'], Pick<DataTableColumn<D, C>, 'cellProps' | 'cellRenderer'>>>;

export const convertConfigsToColumns = <
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D>,
>(
  configs: C[],
  properties: DataTableColumnProperties<D, C>,
): DataTableColumn<D, C>[] =>
  configs.map((config): DataTableColumn<D, C> => ({
    cellProps: properties[config.id as C['id']]?.cellProps,
    cellRenderer: properties[config.id as C['id']]?.cellRenderer,
    config,
    id: config.id,
  }));

export type TableColumnId<C extends DataTableColumnConfig> = C['id'];

export type OrderableTableColumn<
  C extends DataTableColumnConfig,
  I extends string = string,
> = Extract<C, { id: I; isOrderable: true }>;

export const columnIsOrderable = <C extends DataTableColumnConfig>(
  col: C,
): col is OrderableTableColumn<C> => col.isOrderable === true;

export type OrderableTableColumnId<C extends DataTableColumnConfig> = OrderableTableColumn<C>['id'];

export type HideableTableColumn<
  C extends DataTableColumnConfig,
  I extends string = string,
> = Extract<C, { id: I; isHideable?: true }>;

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
  readonly canToggleColumnVisibility: boolean;
  readonly changeRowSelection: (row: D, isSelected: boolean) => void;
  readonly columnIsHidden: (id: string) => boolean;
  readonly columnIsHideable: (id: string) => id is HideableTableColumn<C>['id'];
  readonly columnIsVisible: (id: string) => boolean;
  readonly columns: C[];
  readonly controlBarTargetId: null | string;
  readonly deselectRows: (rows: D | D[] | string | string[]) => void;
  readonly hideableColumns: HideableTableColumn<C>[];
  readonly hideColumn: (id: string) => void;
  readonly isInScope: boolean;
  readonly orderableColumns: OrderableTableColumn<C>[];
  readonly rowIsLoading: (id: D | string) => boolean;
  readonly rowIsLocked: (id: D | string) => boolean;
  readonly rowIsSelected: (row: D | string) => boolean;
  readonly rowsAreDeletable: boolean;
  readonly rowsAreSelectable: boolean;
  readonly rowsHaveActions: boolean;
  readonly selectedRows: D[];
  readonly selectRows: (rows: D | D[]) => void;
  readonly setRowLoading: (id: string, loading: boolean, opts?: { locked?: boolean }) => void;
  readonly setSelectedRows: (selected: D[]) => void;
  readonly setVisibleColumns: (m: string[]) => void;
  readonly showColumn: (id: string) => void;
  readonly syncSelectedRows: (data: D[]) => void;
  readonly toggleColumnVisibility: (id: string) => void;
  readonly toggleRowSelection: (row: D) => void;
  readonly visibleColumns: C[];
}

export interface CellDataTableInstance<
  D extends DataTableDatum,
  C extends DataTableColumnConfig<D> = DataTableColumnConfig<D>,
> extends Pick<DataTableInstance<D, C>, 'setRowLoading'> {}

export type TableFilterWTooltip<
  F extends TableFilters = TableFilters,
  I extends TableFilterId<F> = TableFilterId<F>,
> = {
  readonly id: I;
  readonly isHiddenByDefault?: boolean;
  readonly isHideable?: boolean;
  readonly label: string;
  readonly placeholder?: string;
  readonly renderer: (value: F[I], params: Partial<PopoverRenderProps>) => JSX.Element;
  readonly tooltipLabel: ((value: F[I]) => ReactNode) | string;
};

export type TableFilterWoTooltip<
  F extends TableFilters = TableFilters,
  I extends TableFilterId<F> = TableFilterId<F>,
> = {
  readonly id: I;
  readonly isHiddenByDefault?: boolean;
  readonly isHideable?: boolean;
  readonly label: string;
  readonly placeholder?: string;
  readonly renderer: (value: F[I]) => JSX.Element;
  readonly tooltipLabel?: never;
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
export type TableFilters = Record<string, any>;

export type TableFilterId<F extends TableFilters> = keyof F & string;

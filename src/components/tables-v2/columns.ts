/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DataTableColumnConfig, type DataTableDatum } from "./types";

export type DataTableColumns<
  D extends DataTableDatum,
  I extends string = string,
> = DataTableColumnConfig<D, I>[];

type _TableColumnId<C extends DataTableColumns<any>> = C[number]["id"];

type _TableColumn<C extends DataTableColumns<any>, I extends string = string> = Extract<
  C[number],
  { id: I }
>;

type _OrderableTableColumn<C extends DataTableColumns<any>, I extends string = string> = Extract<
  C[number],
  { isOrderable: true; id: I }
>;

export interface SelectedDataTableColumnsConfiguration<
  I extends C[number]["id"],
  D extends DataTableDatum,
  C extends DataTableColumns<D>,
> {
  readonly columns: _TableColumn<C, I>[];
  readonly orderableColumns: _OrderableTableColumn<C, I>[];
  readonly isOrderableColumnId: (id: string) => id is _OrderableTableColumn<C, I>["id"];
}

export interface DataTableColumnsConfiguration<
  D extends DataTableDatum,
  C extends DataTableColumns<D>,
> {
  readonly columns: C;
  readonly orderableColumns: _OrderableTableColumn<C>[];
  readonly isOrderableColumnId: (id: string) => id is _OrderableTableColumn<C>["id"];
  readonly select: <I extends _TableColumnId<C>>(
    ids: I[],
  ) => SelectedDataTableColumnsConfiguration<I, D, C>;
}

export const ColumnsConfiguration = <D extends DataTableDatum, C extends DataTableColumns<D>>(
  columns: C,
): DataTableColumnsConfiguration<D, C> => ({
  columns,
  orderableColumns: columns.filter(col => col.isOrderable === true) as _OrderableTableColumn<C>[],
  isOrderableColumnId(this, id: string): id is _OrderableTableColumn<C>["id"] {
    return this.columns.some(col => col.id === id && col.isOrderable);
  },
  select: <I extends _TableColumnId<C>>(
    ids: I[],
  ): SelectedDataTableColumnsConfiguration<I, D, C> => ({
    columns: ids.map((id): _TableColumn<C, I> => {
      const c = columns.find(col => col.id === id);
      if (c === undefined) {
        throw new Error(`Column with id ${id} not found!`);
      }
      return c as _TableColumn<C, I>;
    }),
    orderableColumns: ids.reduce(
      (prev, id) => {
        const c = columns.find(col => col.id === id);
        if (c === undefined) {
          throw new Error(`Column with id ${id} not found!`);
        } else if (c.isOrderable) {
          return [...prev, c as _OrderableTableColumn<C, I>];
        }
        return prev;
      },
      [] as _OrderableTableColumn<C, I>[],
    ),
    isOrderableColumnId(this, id: string): id is _OrderableTableColumn<C, I>["id"] {
      return this.columns.some(col => col.id === id && col.isOrderable);
    },
  }),
});

export type TableColumnId<
  C extends
    | DataTableColumnsConfiguration<any, any>
    | SelectedDataTableColumnsConfiguration<any, any, any>,
> = _TableColumnId<C["columns"]>;

export type OrderableTableColumnId<
  C extends
    | DataTableColumnsConfiguration<any, any>
    | SelectedDataTableColumnsConfiguration<any, any, any>,
> = _OrderableTableColumn<C["columns"]>["id"];

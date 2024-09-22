import type * as types from "./types";

import { Button } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

const getItemValue = <D extends types.DataTableDatum, C extends types.DataTableColumnConfig<D>>(
  m: C,
): C["id"] => m.id;

export interface ColumnSelectProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<
    DataSelectProps<C, { behavior: "multi"; getItemValue: typeof getItemValue<D, C> }>,
    "options" | "data"
  > {
  readonly columns: C[];
}

export const ColumnSelect = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  columns,
  ...props
}: ColumnSelectProps<D, C>) => (
  <DataSelect<C, { behavior: "multi"; getItemValue: typeof getItemValue<D, C> }>
    {...props}
    options={{ getItemValue: getItemValue as typeof getItemValue<D, C>, behavior: "multi" }}
    getItemValueLabel={(m: C) => m.label ?? ""}
    data={columns.filter(c => c.isHideable !== false)}
    inputClassName="w-[240px]"
    // menuPlacement="bottom-end"
    menuOffset={{ mainAxis: 4, crossAxis: -50 }}
    menuWidth="available"
    maxHeight={260}
    itemRenderer={m => m.label ?? ""}
  >
    {({ ref, params, isOpen }) => (
      <Button.Solid
        {...params}
        scheme="secondary"
        ref={ref}
        icon={{ right: <CaretIcon open={isOpen} /> }}
      >
        Columns
      </Button.Solid>
    )}
  </DataSelect>
);

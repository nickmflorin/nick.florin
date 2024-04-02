"use client";
import { Button } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { Select } from "~/components/input/select/generic";

import { useTableView } from "../hooks";
import { getColId, type Column, type TableModel } from "../types";

export interface ColumnSelectProps {}

export const ColumnSelect = <T extends TableModel>() => {
  const { columns, visibleColumnIds, canToggleColumnVisibility, setVisibleColumns } =
    useTableView<T>();

  if (!canToggleColumnVisibility) {
    return null;
  }

  return (
    <Select
      options={{
        isMulti: true,
        getItemLabel: (m: Column<T>) => m.title,
        getItemValue: (m: Column<T>) => getColId(m),
      }}
      value={visibleColumnIds}
      data={columns.filter(c => c.isHideable !== false)}
      inputClassName="w-[240px]"
      menuClassName="max-h-[260px]"
      menuPlacement="bottom-end"
      menuOffset={{ mainAxis: 4 }}
      menuWidth={400}
      onChange={v => setVisibleColumns(v)}
    >
      {({ ref, params, isOpen }) => (
        <Button.Secondary {...params} ref={ref} icon={{ right: <CaretIcon open={isOpen} /> }}>
          Columns
        </Button.Secondary>
      )}
    </Select>
  );
};

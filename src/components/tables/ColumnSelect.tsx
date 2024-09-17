"use client";
import { Button } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { DataSelect } from "~/components/input/select/DataSelect";

import { useTableView } from "./hooks";
import { getColId, type Column, type TableModel } from "./types";

export interface ColumnSelectProps {}

export const ColumnSelect = <T extends TableModel>() => {
  const { columns, visibleColumnIds, canToggleColumnVisibility, setVisibleColumns } =
    useTableView<T>();

  if (!canToggleColumnVisibility) {
    return null;
  }

  return (
    <DataSelect
      options={{ getItemValue: (m: Column<T>) => getColId(m), behavior: "multi" }}
      getItemValueLabel={(m: Column<T>) => m.title}
      value={visibleColumnIds}
      data={columns.filter(c => c.isHideable !== false)}
      inputClassName="w-[240px]"
      // menuPlacement="bottom-end"
      menuOffset={{ mainAxis: 4, crossAxis: -50 }}
      menuWidth="available"
      maxHeight={260}
      onChange={v => setVisibleColumns(v)}
      itemRenderer={m => m.title}
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
};

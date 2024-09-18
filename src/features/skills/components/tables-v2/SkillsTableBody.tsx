"use client";
import { useEffect, useState } from "react";

import { uniqBy } from "lodash-es";

import { arraysHaveSameElements } from "~/lib/arrays";

// import { convertConfigsToColumns, type DataTableColumnConfig } from "~/components/tables-v2";
import {
  type DataTableBodyProps,
  DataTableBody,
} from "~/components/tables-v2/data-tables/DataTableBody";
import { type SkillsTableColumnId, type SkillsTableModel } from "~/features/skills";

// import { useSkillsTableColumnProperties } from "./hooks/use-column-properties";
import { SkillsTableControlBar } from "./SkillsTableControlBar";

export interface SkillsTableBodyProps<M extends SkillsTableModel>
  extends Omit<
    DataTableBodyProps<M, SkillsTableColumnId>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns"
  > {
  readonly controlBarTargetId: string;
  readonly controlBarTooltipsInPortal?: boolean;
}

export const SkillsTableBody = <M extends SkillsTableModel>({
  controlBarTargetId,
  controlBarTooltipsInPortal,
  ...props
}: SkillsTableBodyProps<M>): JSX.Element => {
  const [selectedRows, setSelectedRows] = useState<M[]>([]);

  // const columnProperties = useSkillsTableColumnProperties();

  useEffect(() => {
    setSelectedRows(curr => props.data.filter(d => curr.map(r => r.id).includes(d.id)));
  }, [props.data]);

  return (
    <>
      <SkillsTableControlBar
        isDisabled={props.isEmpty}
        targetId={controlBarTargetId}
        tooltipsInPortal={controlBarTooltipsInPortal}
        selectedRows={selectedRows}
        allRowsAreSelected={
          props.data.length !== 0 &&
          arraysHaveSameElements(
            selectedRows.map(r => r.id),
            props.data.map(datum => datum.id),
          )
        }
        onSelectAllRows={selected => (selected ? setSelectedRows(props.data) : setSelectedRows([]))}
      />
      <DataTableBody
        emptyContent="There are no skills."
        noResultsContent="No skills found for search criteria."
        {...props}
        rowIsSelected={datum => selectedRows.map(r => r.id).includes(datum.id)}
        onRowSelected={(datum, isSelected) =>
          setSelectedRows(curr =>
            isSelected ? uniqBy([...curr, datum], d => d.id) : curr.filter(d => d.id !== datum.id),
          )
        }
        columns={[]}
        /* columns={convertConfigsToColumns(
             [...SkillsTableColumns.columns] as DataTableColumnConfig<M, SkillsTableColumnId>[],
             columnProperties,
           )} */
      />
    </>
  );
};

export default SkillsTableBody;

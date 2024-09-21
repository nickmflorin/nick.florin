"use client";
import { ConnectedTableControlBar } from "~/components//tables-v2/ConnectedTableControlBar";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables-v2/data-tables/ConnectedDataTableBody";
import { type SkillsTableColumn, type SkillsTableModel } from "~/features/skills";

import { useSkillsTableColumnProperties } from "./hooks/use-column-properties";

export interface SkillsTableBodyProps<M extends SkillsTableModel>
  extends Omit<
    ConnectedDataTableBodyProps<M, SkillsTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const SkillsTableBody = <M extends SkillsTableModel>({
  controlBarTooltipsInPortal,
  ...props
}: SkillsTableBodyProps<M>): JSX.Element => {
  const columnProperties = useSkillsTableColumnProperties();
  return (
    <>
      <ConnectedTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<M, SkillsTableColumn>
        emptyContent="There are no skills."
        noResultsContent="No skills found for search criteria."
        {...props}
        columnProperties={columnProperties}
      />
    </>
  );
};

export default SkillsTableBody;

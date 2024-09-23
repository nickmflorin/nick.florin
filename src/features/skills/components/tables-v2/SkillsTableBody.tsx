"use client";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables-v2/data-tables/ConnectedDataTableBody";
import { type SkillsTableColumn, type SkillsTableModel } from "~/features/skills";

import { useSkillsTableColumnProperties } from "./hooks/use-column-properties";
import { useSkillsTableRowActions } from "./hooks/use-row-actions";
import { SkillsTableControlBar } from "./SkillsTableControlBar";

export interface SkillsTableBodyProps
  extends Omit<
    ConnectedDataTableBodyProps<SkillsTableModel, SkillsTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const SkillsTableBody = ({
  controlBarTooltipsInPortal,
  ...props
}: SkillsTableBodyProps): JSX.Element => {
  const columnProperties = useSkillsTableColumnProperties();
  const rowActions = useSkillsTableRowActions();

  return (
    <>
      <SkillsTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<SkillsTableModel, SkillsTableColumn>
        performSelectionWhenClicked
        emptyContent="There are no skills."
        noResultsContent="No skills found for search criteria."
        {...props}
        columnProperties={columnProperties}
        getRowActions={(skill, { setIsOpen }) =>
          rowActions(skill, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};

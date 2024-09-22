"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { ConnectedTableControlBar } from "~/components//tables-v2/ConnectedTableControlBar";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables-v2/data-tables/ConnectedDataTableBody";
import { type SkillsTableColumn, type SkillsTableModel } from "~/features/skills";

import { useSkillsTableColumnProperties } from "./hooks/use-column-properties";
import { useSkillsTableRowActions } from "./hooks/use-row-actions";

const DeleteSkillsConfirmationDialog = dynamic(() =>
  import("../dialogs/DeleteSkillsConfirmationDialog").then(
    mod => mod.DeleteSkillsConfirmationDialog,
  ),
);

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
  const rowActions = useSkillsTableRowActions();

  return (
    <>
      <Suspense key="control-bar">
        <ConnectedTableControlBar
          data={props.data}
          isDisabled={props.isEmpty}
          tooltipsInPortal={controlBarTooltipsInPortal}
          confirmationModal={DeleteSkillsConfirmationDialog}
        />
      </Suspense>
      <ConnectedDataTableBody<M, SkillsTableColumn>
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

export default SkillsTableBody;

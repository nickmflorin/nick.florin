"use client";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables/data-tables/ConnectedDataTableBody";
import { type ExperiencesTableColumn, type ExperiencesTableModel } from "~/features/experiences";

import { ExperiencesTableControlBar } from "./ExperiencesTableControlBar";
import { useExperiencesTableColumnProperties } from "./hooks/use-column-properties";
import { useExperiencesTableRowActions } from "./hooks/use-row-actions";

export interface ExperiencesTableBodyProps
  extends Omit<
    ConnectedDataTableBodyProps<ExperiencesTableModel, ExperiencesTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const ExperiencesTableBody = ({
  controlBarTooltipsInPortal,
  ...props
}: ExperiencesTableBodyProps): JSX.Element => {
  const columnProperties = useExperiencesTableColumnProperties();
  const rowActions = useExperiencesTableRowActions();

  return (
    <>
      <ExperiencesTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<ExperiencesTableModel, ExperiencesTableColumn>
        performSelectionWhenClicked
        emptyContent="There are no experiences."
        noResultsContent="No experiences found for search criteria."
        {...props}
        columnProperties={columnProperties}
        getRowActions={(experience, { setIsOpen }) =>
          rowActions(experience, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};

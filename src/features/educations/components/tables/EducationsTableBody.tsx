"use client";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables/data-tables/ConnectedDataTableBody";
import { type EducationsTableColumn, type EducationsTableModel } from "~/features/educations";

import { EducationsTableControlBar } from "./EducationsTableControlBar";
import { useEducationsTableColumnProperties } from "./hooks/use-column-properties";
import { useEducationsTableRowActions } from "./hooks/use-row-actions";

export interface EducationsTableBodyProps
  extends Omit<
    ConnectedDataTableBodyProps<EducationsTableModel, EducationsTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const EducationsTableBody = ({
  controlBarTooltipsInPortal,
  ...props
}: EducationsTableBodyProps): JSX.Element => {
  const columnProperties = useEducationsTableColumnProperties();
  const rowActions = useEducationsTableRowActions();

  return (
    <>
      <EducationsTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<EducationsTableModel, EducationsTableColumn>
        performSelectionWhenClicked
        emptyContent="There are no educations."
        noResultsContent="No educations found for search criteria."
        {...props}
        columnProperties={columnProperties}
        getRowActions={(experience, { setIsOpen }) =>
          rowActions(experience, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};

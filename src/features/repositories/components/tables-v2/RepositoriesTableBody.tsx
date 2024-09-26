"use client";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables-v2/data-tables/ConnectedDataTableBody";
import { type RepositoriesTableColumn, type RepositoriesTableModel } from "~/features/repositories";

import { useRepositoriesTableColumnProperties } from "./hooks/use-column-properties";
import { useRepositoriesTableRowActions } from "./hooks/use-row-actions";
import { RepositoriesTableControlBar } from "./RepositoriesTableControlBar";

export interface RepositoriesTableBodyProps
  extends Omit<
    ConnectedDataTableBodyProps<RepositoriesTableModel, RepositoriesTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const RepositoriesTableBody = ({
  controlBarTooltipsInPortal,
  ...props
}: RepositoriesTableBodyProps): JSX.Element => {
  const columnProperties = useRepositoriesTableColumnProperties();
  const rowActions = useRepositoriesTableRowActions();

  return (
    <>
      <RepositoriesTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<RepositoriesTableModel, RepositoriesTableColumn>
        performSelectionWhenClicked
        emptyContent="There are no repositories."
        noResultsContent="No repositories found for search criteria."
        {...props}
        columnProperties={columnProperties}
        getRowActions={(experience, { setIsOpen }) =>
          rowActions(experience, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};

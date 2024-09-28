"use client";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables/data-tables/ConnectedDataTableBody";
import { type CoursesTableColumn, type CoursesTableModel } from "~/features/courses";

import { CoursesTableControlBar } from "./CoursesTableControlBar";
import { useCoursesTableColumnProperties } from "./hooks/use-column-properties";
import { useCoursesTableRowActions } from "./hooks/use-row-actions";

export interface CoursesTableBodyProps
  extends Omit<
    ConnectedDataTableBodyProps<CoursesTableModel, CoursesTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const CoursesTableBody = ({
  controlBarTooltipsInPortal,
  ...props
}: CoursesTableBodyProps): JSX.Element => {
  const columnProperties = useCoursesTableColumnProperties();
  const rowActions = useCoursesTableRowActions();

  return (
    <>
      <CoursesTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<CoursesTableModel, CoursesTableColumn>
        performSelectionWhenClicked
        emptyContent="There are no courses."
        noResultsContent="No courses found for search criteria."
        {...props}
        columnProperties={columnProperties}
        getRowActions={(experience, { setIsOpen }) =>
          rowActions(experience, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};

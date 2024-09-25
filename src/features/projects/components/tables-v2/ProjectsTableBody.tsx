"use client";
import {
  type ConnectedDataTableBodyProps,
  ConnectedDataTableBody,
} from "~/components/tables-v2/data-tables/ConnectedDataTableBody";
import { type ProjectsTableColumn, type ProjectsTableModel } from "~/features/projects";

import { useProjectsTableColumnProperties } from "./hooks/use-column-properties";
import { useProjectsTableRowActions } from "./hooks/use-row-actions";
import { ProjectsTableControlBar } from "./ProjectsTableControlBar";

export interface ProjectsTableBodyProps
  extends Omit<
    ConnectedDataTableBodyProps<ProjectsTableModel, ProjectsTableColumn>,
    "rowIsSelected" | "onRowSelected" | "getRowActions" | "columns" | "columnProperties"
  > {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const ProjectsTableBody = ({
  controlBarTooltipsInPortal,
  ...props
}: ProjectsTableBodyProps): JSX.Element => {
  const columnProperties = useProjectsTableColumnProperties();
  const rowActions = useProjectsTableRowActions();

  return (
    <>
      <ProjectsTableControlBar
        data={props.data}
        isDisabled={props.isEmpty}
        tooltipsInPortal={controlBarTooltipsInPortal}
      />
      <ConnectedDataTableBody<ProjectsTableModel, ProjectsTableColumn>
        performSelectionWhenClicked
        emptyContent="There are no projects."
        noResultsContent="No projects found for search criteria."
        {...props}
        columnProperties={columnProperties}
        getRowActions={(project, { setIsOpen }) =>
          rowActions(project, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};

import { useMemo } from "react";

import { type DataTableColumnProperties } from "~/components/tables";
import { ReadOnlyDateTimeCell } from "~/components/tables/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables/hooks";
import { type ProjectsTableModel, type ProjectsTableColumn } from "~/features/projects";

import { HighlightedCell } from "../cells/HighlightedCell";
import { RepositoriesCell } from "../cells/RepositoriesCell";
import { SkillsCell } from "../cells/SkillsCell";
import { VisibleCell } from "../cells/VisibleCell";

export const useProjectsTableColumnProperties = (): DataTableColumnProperties<
  ProjectsTableModel,
  ProjectsTableColumn
> => {
  const { setRowLoading } = useDataTable<ProjectsTableModel, ProjectsTableColumn>();
  return useMemo(
    () => ({
      name: {
        cellRenderer(datum) {
          return datum.name;
        },
      },
      shortName: {
        cellRenderer(datum) {
          return datum.shortName;
        },
      },
      updatedAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.updatedAt} />;
        },
      },
      createdAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.createdAt} />;
        },
      },
      startDate: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.startDate} />;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell project={datum} table={{ setRowLoading }} />;
        },
      },
      repositories: {
        cellRenderer(datum) {
          return <RepositoriesCell project={datum} table={{ setRowLoading }} />;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell project={datum} table={{ setRowLoading }} />;
        },
      },
      visible: {
        cellRenderer(datum) {
          return <VisibleCell project={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

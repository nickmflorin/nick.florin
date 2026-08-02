import { useMemo } from 'react';

import { type DataTableColumnProperties } from '~/components/tables';
import { ReadOnlyDateTimeCell } from '~/components/tables/cells/ReadOnlyDateTimeCell';
import { useDataTable } from '~/components/tables/hooks';
import { type ProjectsTableColumn, type ProjectsTableModel } from '~/features/projects';

import { HighlightedCell } from '../cells/HighlightedCell';
import { RepositoriesCell } from '../cells/RepositoriesCell';
import { SkillsCell } from '../cells/SkillsCell';
import { VisibleCell } from '../cells/VisibleCell';

export const useProjectsTableColumnProperties = (): DataTableColumnProperties<
  ProjectsTableModel,
  ProjectsTableColumn
> => {
  const { setRowLoading } = useDataTable<ProjectsTableModel, ProjectsTableColumn>();
  return useMemo(
    () => ({
      createdAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.createdAt} />;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell project={datum} table={{ setRowLoading }} />;
        },
      },
      name: {
        cellRenderer(datum) {
          return datum.name;
        },
      },
      repositories: {
        cellRenderer(datum) {
          return <RepositoriesCell project={datum} table={{ setRowLoading }} />;
        },
      },
      shortName: {
        cellRenderer(datum) {
          return datum.shortName;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell project={datum} table={{ setRowLoading }} />;
        },
      },
      startDate: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.startDate} />;
        },
      },
      updatedAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.updatedAt} />;
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

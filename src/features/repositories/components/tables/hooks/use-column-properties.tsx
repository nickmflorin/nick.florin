import { useMemo } from 'react';

import { NpmLink } from '~/components/buttons/NpmLink';
import { type DataTableColumnProperties } from '~/components/tables';
import { ReadOnlyDateTimeCell } from '~/components/tables/cells/ReadOnlyDateTimeCell';
import { useDataTable } from '~/components/tables/hooks';
import { type RepositoriesTableColumn, type RepositoriesTableModel } from '~/features/repositories';

import { HighlightedCell } from '../cells/HighlightedCell';
import { ProjectsCell } from '../cells/ProjectsCell';
import { SkillsCell } from '../cells/SkillsCell';
import { VisibleCell } from '../cells/VisibleCell';

export const useRepositoriesTableColumnProperties = (): DataTableColumnProperties<
  RepositoriesTableModel,
  RepositoriesTableColumn
> => {
  const { setRowLoading } = useDataTable<RepositoriesTableModel, RepositoriesTableColumn>();
  return useMemo(
    () => ({
      createdAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.createdAt} />;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell repository={datum} table={{ setRowLoading }} />;
        },
      },
      npmPackageName: {
        cellRenderer(datum) {
          return datum.npmPackageName ? <NpmLink npmPackageName={datum.npmPackageName} /> : null;
        },
      },
      projects: {
        cellRenderer(datum) {
          return <ProjectsCell repository={datum} table={{ setRowLoading }} />;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell repository={datum} table={{ setRowLoading }} />;
        },
      },
      slug: {
        cellRenderer(datum) {
          return datum.slug;
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
          return <VisibleCell repository={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

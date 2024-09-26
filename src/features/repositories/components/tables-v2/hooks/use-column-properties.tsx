import { useMemo } from "react";

import { NpmLink } from "~/components/buttons/NpmLink";
import { type DataTableColumnProperties } from "~/components/tables-v2";
import { ReadOnlyDateTimeCell } from "~/components/tables-v2/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables-v2/hooks";
import { type RepositoriesTableModel, type RepositoriesTableColumn } from "~/features/repositories";

import { HighlightedCell } from "../cells/HighlightedCell";
import { ProjectsCell } from "../cells/ProjectsCell";
import { SkillsCell } from "../cells/SkillsCell";
import { VisibleCell } from "../cells/VisibleCell";

export const useRepositoriesTableColumnProperties = (): DataTableColumnProperties<
  RepositoriesTableModel,
  RepositoriesTableColumn
> => {
  const { setRowLoading } = useDataTable<RepositoriesTableModel, RepositoriesTableColumn>();
  return useMemo(
    () => ({
      slug: {
        cellRenderer(datum) {
          return datum.slug;
        },
      },
      npmPackageName: {
        cellRenderer(datum) {
          return datum.npmPackageName ? <NpmLink npmPackageName={datum.npmPackageName} /> : <></>;
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
          return <SkillsCell repository={datum} table={{ setRowLoading }} />;
        },
      },
      projects: {
        cellRenderer(datum) {
          return <ProjectsCell repository={datum} table={{ setRowLoading }} />;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell repository={datum} table={{ setRowLoading }} />;
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

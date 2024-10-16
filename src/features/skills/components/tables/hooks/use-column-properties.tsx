import { useMemo } from "react";

import { type DataTableColumnProperties } from "~/components/tables";
import { ReadOnlyDateTimeCell } from "~/components/tables/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables/hooks";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills";

import { CategoriesCell } from "../cells/CategoriesCell";
import { EducationsCell } from "../cells/EducationsCell";
import { ExperienceCell } from "../cells/ExperienceCell";
import { ExperiencesCell } from "../cells/ExperiencesCell";
import { HighlightedCell } from "../cells/HighlightedCell";
import { PrioritizedCell } from "../cells/PrioritizedCell";
import { ProgrammingDomainsCell } from "../cells/ProgrammingDomainsCell";
import { ProgrammingLanguagesCell } from "../cells/ProgrammingLanguagesCell";
import { ProjectsCell } from "../cells/ProjectsCell";
import { RepositoriesCell } from "../cells/RepositoriesCell";
import { VisibleCell } from "../cells/VisibleCell";

export const useSkillsTableColumnProperties = (): DataTableColumnProperties<
  SkillsTableModel,
  SkillsTableColumn
> => {
  const { setRowLoading } = useDataTable<SkillsTableModel, SkillsTableColumn>();
  return useMemo(
    () => ({
      label: {
        cellRenderer(datum) {
          return datum.label;
        },
      },
      slug: {
        cellRenderer(datum) {
          return datum.slug;
        },
      },
      experience: {
        cellRenderer(datum) {
          return <ExperienceCell skill={datum} />;
        },
      },
      categories: {
        cellRenderer(datum) {
          return <CategoriesCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      programmingLanguages: {
        cellRenderer(datum) {
          return <ProgrammingLanguagesCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      programmingDomains: {
        cellRenderer(datum) {
          return <ProgrammingDomainsCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      projects: {
        cellRenderer(datum) {
          return <ProjectsCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      repositories: {
        cellRenderer(datum) {
          return <RepositoriesCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      experiences: {
        cellRenderer(datum) {
          return <ExperiencesCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      educations: {
        cellRenderer(datum) {
          return <EducationsCell skill={datum} table={{ setRowLoading }} />;
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
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      prioritized: {
        cellRenderer(datum) {
          return <PrioritizedCell skill={datum} table={{ setRowLoading }} />;
        },
      },
      visible: {
        cellRenderer(datum) {
          return <VisibleCell skill={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

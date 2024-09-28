import { useMemo } from "react";

import { type DataTableColumnProperties } from "~/components/tables";
import { ReadOnlyDateTimeCell } from "~/components/tables/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables/hooks";
import { type CoursesTableModel, type CoursesTableColumn } from "~/features/courses";

import { EducationCell } from "../cells/EducationCell";
import { SkillsCell } from "../cells/SkillsCell";
import { VisibleCell } from "../cells/VisibleCell";

export const useCoursesTableColumnProperties = (): DataTableColumnProperties<
  CoursesTableModel,
  CoursesTableColumn
> => {
  const { setRowLoading } = useDataTable<CoursesTableModel, CoursesTableColumn>();
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
      slug: {
        cellRenderer(datum) {
          return datum.slug;
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
      education: {
        cellRenderer(datum) {
          return <EducationCell course={datum} table={{ setRowLoading }} />;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell course={datum} table={{ setRowLoading }} />;
        },
      },
      visible: {
        cellRenderer(datum) {
          return <VisibleCell course={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

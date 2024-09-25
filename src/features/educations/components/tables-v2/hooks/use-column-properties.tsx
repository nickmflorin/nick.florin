import { useMemo } from "react";

import { type DataTableColumnProperties } from "~/components/tables-v2";
import { ReadOnlyDateTimeCell } from "~/components/tables-v2/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables-v2/hooks";
import { type EducationsTableModel, type EducationsTableColumn } from "~/features/educations";
import { DetailsCell } from "~/features/resume/components/tables/cells/DetailsCell";

import { DegreeCell } from "../cells/DegreeCell";
import { HighlightedCell } from "../cells/HighlightedCell";
import { PostPonedCell } from "../cells/PostPonedCell";
import { SchoolCell } from "../cells/SchoolCell";
import { SkillsCell } from "../cells/SkillsCell";
import { VisibleCell } from "../cells/VisibleCell";

export const useEducationsTableColumnProperties = (): DataTableColumnProperties<
  EducationsTableModel,
  EducationsTableColumn
> => {
  const { setRowLoading } = useDataTable<EducationsTableModel, EducationsTableColumn>();
  return useMemo(
    () => ({
      major: {
        cellRenderer(datum) {
          return datum.major;
        },
      },
      shortMajor: {
        cellRenderer(datum) {
          return datum.shortMajor;
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
      endDate: {
        cellRenderer(datum) {
          return datum.endDate ? <ReadOnlyDateTimeCell date={datum.endDate} /> : <></>;
        },
      },
      details: {
        cellRenderer(datum) {
          return <DetailsCell model={datum} />;
        },
      },
      school: {
        cellRenderer(datum) {
          return <SchoolCell education={datum} table={{ setRowLoading }} />;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell education={datum} table={{ setRowLoading }} />;
        },
      },
      degree: {
        cellRenderer(datum) {
          return <DegreeCell education={datum} table={{ setRowLoading }} />;
        },
      },
      postPoned: {
        cellRenderer(datum) {
          return <PostPonedCell education={datum} table={{ setRowLoading }} />;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell education={datum} table={{ setRowLoading }} />;
        },
      },
      visible: {
        cellRenderer(datum) {
          return <VisibleCell education={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

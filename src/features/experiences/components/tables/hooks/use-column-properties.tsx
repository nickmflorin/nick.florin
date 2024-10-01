import { useMemo } from "react";

import { type DataTableColumnProperties } from "~/components/tables";
import { ReadOnlyDateTimeCell } from "~/components/tables/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables/hooks";
import { type ExperiencesTableModel, type ExperiencesTableColumn } from "~/features/experiences";
import { DetailsCell } from "~/features/resume/components/tables/cells/DetailsCell";

import { CompanyCell } from "../cells/CompanyCell";
import { CurrentCell } from "../cells/CurrentCell";
import { HighlightedCell } from "../cells/HighlightedCell";
import { RemoteCell } from "../cells/RemoteCell";
import { SkillsCell } from "../cells/SkillsCell";
import { VisibleCell } from "../cells/VisibleCell";

export const useExperiencesTableColumnProperties = (): DataTableColumnProperties<
  ExperiencesTableModel,
  ExperiencesTableColumn
> => {
  const { setRowLoading } = useDataTable<ExperiencesTableModel, ExperiencesTableColumn>();
  return useMemo(
    () => ({
      title: {
        cellRenderer(datum) {
          return datum.title;
        },
      },
      shortTitle: {
        cellRenderer(datum) {
          return datum.shortTitle;
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
      company: {
        cellRenderer(datum) {
          return <CompanyCell experience={datum} table={{ setRowLoading }} />;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell experience={datum} table={{ setRowLoading }} />;
        },
      },
      isRemote: {
        cellRenderer(datum) {
          return <RemoteCell experience={datum} table={{ setRowLoading }} />;
        },
      },
      isCurrent: {
        cellRenderer(datum) {
          return <CurrentCell experience={datum} table={{ setRowLoading }} />;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell experience={datum} table={{ setRowLoading }} />;
        },
      },
      visible: {
        cellRenderer(datum) {
          return <VisibleCell experience={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

import { useMemo } from 'react';

import { type DataTableColumnProperties } from '~/components/tables';
import { ReadOnlyDateTimeCell } from '~/components/tables/cells/ReadOnlyDateTimeCell';
import { useDataTable } from '~/components/tables/hooks';
import { type EducationsTableColumn, type EducationsTableModel } from '~/features/educations';
import { DetailsCell } from '~/features/resume/components/tables/cells/DetailsCell';

import { DegreeCell } from '../cells/DegreeCell';
import { HighlightedCell } from '../cells/HighlightedCell';
import { PostPonedCell } from '../cells/PostPonedCell';
import { SchoolCell } from '../cells/SchoolCell';
import { SkillsCell } from '../cells/SkillsCell';
import { VisibleCell } from '../cells/VisibleCell';

export const useEducationsTableColumnProperties = (): DataTableColumnProperties<
  EducationsTableModel,
  EducationsTableColumn
> => {
  const { setRowLoading } = useDataTable<EducationsTableModel, EducationsTableColumn>();
  return useMemo(
    () => ({
      createdAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.createdAt} />;
        },
      },
      degree: {
        cellRenderer(datum) {
          return <DegreeCell education={datum} table={{ setRowLoading }} />;
        },
      },
      details: {
        cellRenderer(datum) {
          return <DetailsCell model={datum} />;
        },
      },
      endDate: {
        cellRenderer(datum) {
          return datum.endDate ? <ReadOnlyDateTimeCell date={datum.endDate} /> : null;
        },
      },
      highlighted: {
        cellRenderer(datum) {
          return <HighlightedCell education={datum} table={{ setRowLoading }} />;
        },
      },
      major: {
        cellRenderer(datum) {
          return datum.major;
        },
      },
      postPoned: {
        cellRenderer(datum) {
          return <PostPonedCell education={datum} table={{ setRowLoading }} />;
        },
      },
      school: {
        cellRenderer(datum) {
          return <SchoolCell education={datum} table={{ setRowLoading }} />;
        },
      },
      shortMajor: {
        cellRenderer(datum) {
          return datum.shortMajor;
        },
      },
      skills: {
        cellRenderer(datum) {
          return <SkillsCell education={datum} table={{ setRowLoading }} />;
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
          return <VisibleCell education={datum} table={{ setRowLoading }} />;
        },
      },
    }),
    [setRowLoading],
  );
};

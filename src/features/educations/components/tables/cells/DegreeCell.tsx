'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Degree } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateEducation } from '~/actions/educations/update-education';

import type * as types from '~/components/tables/types';
import { DegreeSelect } from '~/features/educations/components/input/DegreeSelect';
import { type EducationsTableColumn, type EducationsTableModel } from '~/features/educations/types';

interface DegreeCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const DegreeCell = ({ education, table }: DegreeCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic<Degree>(education.degree);
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <DegreeSelect
      behavior='single'
      inputClassName='w-full'
      isInPortal
      onChange={(v, { item }) => {
        transition(async () => {
          setValue(v);
          item?.setLoading(true);
          table.setRowLoading(education.id, true);
          let response: Awaited<ReturnType<typeof updateEducation>> | undefined = undefined;
          try {
            response = await updateEducation(education.id, { degree: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the degree for the education with ' +
                `ID '${education.id}'.`,
              { degree: v, education },
            );
            item?.setLoading(false);
            table.setRowLoading(education.id, false);
            toast.error('There was an error updating the education.');
            return;
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              'There was a client error updating the degree for the education with ID ' +
                `'${education.id}': ${error.code}`,
              { degree: v, education },
            );
            item?.setLoading(false);
            table.setRowLoading(education.id, false);
            toast.error('There was an error updating the education.');
            return;
          }
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(education.id, false);
        });
      }}
      value={value}
    />
  );
};

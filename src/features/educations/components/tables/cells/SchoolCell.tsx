'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateEducation } from '~/actions/educations/update-education';

import type * as types from '~/components/tables/types';
import { type EducationsTableColumn, type EducationsTableModel } from '~/features/educations/types';
import { ClientSchoolSelect } from '~/features/schools/components/input/ClientSchoolSelect';

interface SchoolCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const SchoolCell = ({ education, table }: SchoolCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(education.school.id);
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ClientSchoolSelect
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
            response = await updateEducation(education.id, { school: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the school for the education with ' +
                `ID '${education.id}'.`,
              { education, school: v },
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
              'There was a client error updating the school for the education with ID ' +
                `'${education.id}': ${error.code}`,
              { education, school: v },
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
      visibility='admin'
    />
  );
};

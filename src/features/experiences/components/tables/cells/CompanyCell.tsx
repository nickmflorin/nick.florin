'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateExperience } from '~/actions/experiences/update-experience';

import type * as types from '~/components/tables/types';
import { ClientCompanySelect } from '~/features/companies/components/input/ClientCompanySelect';
import {
  type ExperiencesTableColumn,
  type ExperiencesTableModel,
} from '~/features/experiences/types';

interface CompanyCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const CompanyCell = ({ experience, table }: CompanyCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(experience.company.id);
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ClientCompanySelect
      behavior='single'
      inputClassName='w-full'
      isInPortal
      onChange={(v, { item }) => {
        transition(async () => {
          setValue(v);
          item?.setLoading(true);
          table.setRowLoading(experience.id, true);
          let response: Awaited<ReturnType<typeof updateExperience>> | undefined = undefined;
          try {
            response = await updateExperience(experience.id, { company: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the company for the experience with ' +
                `ID '${experience.id}'.`,
              { company: v, experience },
            );
            item?.setLoading(false);
            table.setRowLoading(experience.id, false);
            toast.error('There was an error updating the experience.');
            return;
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              'There was a client error updating the company for the experience with ID ' +
                `'${experience.id}': ${error.code}`,
              { company: v, experience },
            );
            item?.setLoading(false);
            table.setRowLoading(experience.id, false);
            toast.error('There was an error updating the experience.');
            return;
          }
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(experience.id, false);
        });
      }}
      value={value}
      visibility='admin'
    />
  );
};

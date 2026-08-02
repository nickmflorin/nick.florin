'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateEducation } from '~/actions/educations/update-education';

import type * as types from '~/components/tables/types';
import { type EducationsTableColumn, type EducationsTableModel } from '~/features/educations/types';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

interface SkillsCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const SkillsCell = ({ education, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(education.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ClientSkillsSelect
      behavior='multi'
      inputClassName='w-full'
      isClearable
      isInPortal
      onChange={(v, { item }) => {
        transition(async () => {
          setValue(v);
          item?.setLoading(true);
          table.setRowLoading(education.id, true);

          let response: Awaited<ReturnType<typeof updateEducation>> | undefined = undefined;
          try {
            response = await updateEducation(education.id, { skills: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the skills for the education with ' +
                `ID '${education.id}'.`,
              {
                education: education.id,
                skills: v,
              },
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
              'There was a client error updating the skills for the education with ID ' +
                `'${education.id}': ${error.code}`,
              { education, skills: v },
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
      summarizeValueAfter={2}
      value={value}
      visibility='admin'
    />
  );
};

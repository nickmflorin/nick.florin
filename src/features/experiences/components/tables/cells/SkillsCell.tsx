'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateExperience } from '~/actions/experiences/update-experience';

import type * as types from '~/components/tables/types';
import {
  type ExperiencesTableColumn,
  type ExperiencesTableModel,
} from '~/features/experiences/types';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

interface SkillsCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const SkillsCell = ({ experience, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(experience.skills.map(exp => exp.id));
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
          table.setRowLoading(experience.id, true);

          let response: Awaited<ReturnType<typeof updateExperience>> | undefined = undefined;
          try {
            response = await updateExperience(experience.id, { skills: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the skills for the experience with ' +
                `ID '${experience.id}'.`,
              {
                experience: experience.id,
                skills: v,
              },
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
              'There was a client error updating the skills for the experience with ID ' +
                `'${experience.id}': ${error.code}`,
              { experience, skills: v },
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
      summarizeValueAfter={2}
      value={value}
      visibility='admin'
    />
  );
};

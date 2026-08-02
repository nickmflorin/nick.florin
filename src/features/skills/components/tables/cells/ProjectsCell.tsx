'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateSkill } from '~/actions/skills/update-skill';

import type * as types from '~/components/tables/types';
import { ClientProjectSelect } from '~/features/projects/components/input/ClientProjectSelect';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills/types';

interface ProjectsCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ProjectsCell = ({ skill, table }: ProjectsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(skill.projects.map(p => p.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ClientProjectSelect
      behavior='multi'
      inputClassName='w-full'
      isClearable
      isInPortal
      onChange={(v, { item }) => {
        transition(async () => {
          setValue(v);
          item?.setLoading(true);
          table.setRowLoading(skill.id, true);

          let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
          try {
            response = await updateSkill(skill.id, { projects: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error updating the projects for the skill with ID '${skill.id}'.`,
              {
                projects: v,
                skill: skill.id,
              },
            );
            item?.setLoading(false);
            table.setRowLoading(skill.id, false);
            toast.error('There was an error updating the skill.');
            return;
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              'There was a client error updating the projects for the skill with ID ' +
                `'${skill.id}': ${error.code}`,
              { projects: v, skill: skill.id },
            );
            item?.setLoading(false);
            table.setRowLoading(skill.id, false);
            toast.error('There was an error updating the skill.');
            return;
          }
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(skill.id, false);
        });
      }}
      summarizeValueAfter={2}
      value={value}
      visibility='admin'
    />
  );
};

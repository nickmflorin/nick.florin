'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateProject } from '~/actions/projects/update-project';

import type * as types from '~/components/tables/types';
import { type ProjectsTableColumn, type ProjectsTableModel } from '~/features/projects/types';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

interface SkillsCellProps {
  readonly project: ProjectsTableModel;
  readonly table: types.CellDataTableInstance<ProjectsTableModel, ProjectsTableColumn>;
}

export const SkillsCell = ({ project, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(project.skills.map(exp => exp.id));
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
          table.setRowLoading(project.id, true);

          let response: Awaited<ReturnType<typeof updateProject>> | undefined = undefined;
          try {
            response = await updateProject(project.id, { skills: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the skills for the project with ' +
                `ID '${project.id}'.`,
              { project: project.id, skills: v },
            );
            item?.setLoading(false);
            table.setRowLoading(project.id, false);
            toast.error('There was an error updating the project.');
            return;
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              'There was a client error updating the skills for the project with ID ' +
                `'${project.id}': ${error.code}`,
              { project, skills: v },
            );
            item?.setLoading(false);
            table.setRowLoading(project.id, false);
            toast.error('There was an error updating the project.');
            return;
          }
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(project.id, false);
        });
      }}
      summarizeValueAfter={2}
      value={value}
      visibility='admin'
    />
  );
};

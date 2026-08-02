'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateRepository } from '~/actions/repositories/update-repository';

import type * as types from '~/components/tables/types';
import {
  type RepositoriesTableColumn,
  type RepositoriesTableModel,
} from '~/features/repositories/types';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

interface SkillsCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const SkillsCell = ({ repository, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(repository.skills.map(exp => exp.id));
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
          table.setRowLoading(repository.id, true);

          let response: Awaited<ReturnType<typeof updateRepository>> | undefined = undefined;
          try {
            response = await updateRepository(repository.id, { skills: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the skills for the repository with ' +
                `ID '${repository.id}'.`,
              {
                repository: repository.id,
                skills: v,
              },
            );
            item?.setLoading(false);
            table.setRowLoading(repository.id, false);
            toast.error('There was an error updating the repository.');
            return;
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              'There was a client error updating the skills for the repository with ID ' +
                `'${repository.id}': ${error.code}`,
              { repository, skills: v },
            );
            item?.setLoading(false);
            table.setRowLoading(repository.id, false);
            toast.error('There was an error updating the repository.');
            return;
          }
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(repository.id, false);
        });
      }}
      summarizeValueAfter={2}
      value={value}
      visibility='admin'
    />
  );
};

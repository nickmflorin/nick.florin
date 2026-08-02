'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateRepository } from '~/actions/repositories/update-repository';

import type * as types from '~/components/tables/types';
import { ClientProjectSelect } from '~/features/projects/components/input/ClientProjectSelect';
import {
  type RepositoriesTableColumn,
  type RepositoriesTableModel,
} from '~/features/repositories/types';

interface ProjectsCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const ProjectsCell = ({ repository, table }: ProjectsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(repository.projects.map(p => p.id));
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
          table.setRowLoading(repository.id, true);

          let response: Awaited<ReturnType<typeof updateRepository>> | undefined = undefined;
          try {
            response = await updateRepository(repository.id, { projects: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was an error updating the projects for the repository with ID ' +
                `'${repository.id}'.`,
              {
                projects: v,
                repository: repository.id,
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
              'There was a client error updating the projects for the repository with ID ' +
                `'${repository.id}': ${error.code}`,
              { projects: v, repository: repository.id },
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

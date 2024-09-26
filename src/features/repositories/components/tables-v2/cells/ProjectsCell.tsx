"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateRepository } from "~/actions-v2/repositories/update-repository";

import type * as types from "~/components/tables-v2/types";
import { ClientProjectSelect } from "~/features/projects/components/input/ClientProjectSelect";
import { type RepositoriesTableColumn, type RepositoriesTableModel } from "~/features/repositories/types";

interface ProjectsCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const ProjectsCell = ({ repository, table }: ProjectsCellProps): JSX.Element => {
  const [value, setValue] = useState(repository.projects.map(p => p.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(repository.projects.map(p => p.id));
  }, [repository.projects]);

  return (
    <ClientProjectSelect
      inputClassName="w-full"
      visibility="admin"
      value={value}
      summarizeValueAfter={2}
      behavior="multi"
      inPortal
      isClearable
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(repository.id, true);

        let response: Awaited<ReturnType<typeof updateRepository>> | undefined = undefined;
        try {
          response = await updateRepository(repository.id, { projects: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the projects for the repository with ID '${repository.id}'.`,
            {
              repository: repository.id,
              projects: v,
            },
          );
          item?.setLoading(false);
          table.setRowLoading(repository.id, false);
          return toast.error("There was an error updating the repository.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the projects for the repository with ID " +
              `'${repository.id}': ${error.code}`,
            { repository: repository.id, projects: v },
          );
          item?.setLoading(false);
          table.setRowLoading(repository.id, false);
          return toast.error("There was an error updating the repository.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(repository.id, false);
        });
      }}
    />
  );
};

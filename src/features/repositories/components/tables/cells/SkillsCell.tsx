"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateRepository } from "~/actions/repositories/update-repository";

import type * as types from "~/components/tables/types";
import type {
  RepositoriesTableColumn,
  RepositoriesTableModel,
} from "~/features/repositories/types";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

interface SkillsCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const SkillsCell = ({ repository, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useState(repository.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(repository.skills.map(exp => exp.id));
  }, [repository.skills]);

  return (
    <ClientSkillsSelect
      visibility="admin"
      inputClassName="w-full"
      inPortal
      value={value}
      behavior="multi"
      summarizeValueAfter={2}
      isClearable
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(repository.id, true);

        let response: Awaited<ReturnType<typeof updateRepository>> | undefined = undefined;
        try {
          response = await updateRepository(repository.id, { skills: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the skills for the repository with " +
              `ID '${repository.id}'.`,
            {
              repository: repository.id,
              skills: v,
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
            "There was a client error updating the skills for the repository with ID " +
              `'${repository.id}': ${error.code}`,
            { repository, skills: v },
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

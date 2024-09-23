"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions-v2/skills/update-skill";

import type * as types from "~/components/tables-v2/types";
import { ClientRepositorySelect } from "~/features/repositories/components/input/ClientRepositorySelect";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills/types";

interface RepositoriesCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const RepositoriesCell = ({ skill, table }: RepositoriesCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.repositories.map(p => p.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.repositories.map(p => p.id));
  }, [skill.repositories]);

  return (
    <ClientRepositorySelect
      inPortal
      behavior="multi"
      summarizeValueAfter={2}
      isClearable
      inputClassName="w-full"
      value={value}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(skill.id, true);

        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { repositories: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the repositories for the skill with ID '${skill.id}':\n${e}`,
            {
              skill: skill.id,
              experiences: v,
            },
          );
          item?.setLoading(false);
          table.setRowLoading(skill.id, false);
          return toast.error("There was an error updating the skill.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the repositories for the skill with ID " +
              `'${skill.id}': ${error.code}`,
            {
              skill: skill.id,
              experiences: v,
            },
          );
          item?.setLoading(false);
          table.setRowLoading(skill.id, false);
          return toast.error("There was an error updating the skill.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(skill.id, false);
        });
      }}
    />
  );
};

export default RepositoriesCell;

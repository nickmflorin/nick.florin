"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions-v2/skills/update-skill";

import { Checkbox } from "~/components/input/Checkbox";
import type * as types from "~/components/tables-v2/types";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills/types";

interface ShowInTopSkillsCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ShowInTopSkillsCell = ({ skill, table }: ShowInTopSkillsCellProps): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(skill.includeInTopSkills);

  useEffect(() => {
    setChecked(skill.includeInTopSkills);
  }, [skill.includeInTopSkills]);

  return (
    <Checkbox
      value={checked}
      onChange={async e => {
        // Set checked state optimistically.
        setChecked(e.target.checked);
        table.setRowLoading(skill.id, true);

        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { includeInTopSkills: e.target.checked });
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the top skills flag for the skill with ID '${skill.id}':\n${e}`,
            { skill: skill.id },
          );
          table.setRowLoading(skill.id, false);
          return toast.error("There was an error updating the skill.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            `There was an error updating the top skills flag for the skill with ID '${skill.id}'.`,
            { skill: skill.id },
          );
          table.setRowLoading(skill.id, false);
          return toast.error("There was an error updating the skill.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          table.setRowLoading(skill.id, false);
        });
      }}
    />
  );
};

export default ShowInTopSkillsCell;

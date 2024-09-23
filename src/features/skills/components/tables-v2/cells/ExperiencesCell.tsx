"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions-v2/skills/update-skill";

import type * as types from "~/components/tables-v2/types";
import { ClientExperienceSelect } from "~/features/experiences/components/input/ClientExperienceSelect";
import type { SkillsTableColumn, SkillsTableModel } from "~/features/skills/types";

interface ExperiencesCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ExperiencesCell = ({ skill, table }: ExperiencesCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.experiences.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.experiences.map(exp => exp.id));
  }, [skill.experiences]);

  return (
    <ClientExperienceSelect
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
        table.setRowLoading(skill.id, true);

        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { experiences: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was a server error updating the experiences for the skill with ID '${skill.id}'.`,
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
            "There was a client error updating the experiences for the skill with ID " +
              `'${skill.id}': ${error.code}`,
            {
              response,
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

export default ExperiencesCell;

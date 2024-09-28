"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateExperience } from "~/actions-v2/experiences/update-experience";

import type * as types from "~/components/tables/types";
import type { ExperiencesTableColumn, ExperiencesTableModel } from "~/features/experiences/types";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

interface SkillsCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const SkillsCell = ({ experience, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useState(experience.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(experience.skills.map(exp => exp.id));
  }, [experience.skills]);

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
        table.setRowLoading(experience.id, true);

        let response: Awaited<ReturnType<typeof updateExperience>> | undefined = undefined;
        try {
          response = await updateExperience(experience.id, { skills: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the skills for the experience with " +
              `ID '${experience.id}'.`,
            {
              experience: experience.id,
              skills: v,
            },
          );
          item?.setLoading(false);
          table.setRowLoading(experience.id, false);
          return toast.error("There was an error updating the experience.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the skills for the experience with ID " +
              `'${experience.id}': ${error.code}`,
            { experience, skills: v },
          );
          item?.setLoading(false);
          table.setRowLoading(experience.id, false);
          return toast.error("There was an error updating the experience.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(experience.id, false);
        });
      }}
    />
  );
};

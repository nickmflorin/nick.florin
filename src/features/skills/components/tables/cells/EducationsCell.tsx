"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions/skills/update-skill";

import type * as types from "~/components/tables/types";
import { ClientEducationSelect } from "~/features/educations/components/input/ClientEducationSelect";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills/types";

interface EducationsCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const EducationsCell = ({ skill, table }: EducationsCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.educations.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.educations.map(exp => exp.id));
  }, [skill.educations]);

  return (
    <ClientEducationSelect
      visibility="admin"
      inputClassName="w-full"
      behavior="multi"
      isClearable
      includes={[]}
      value={value}
      inPortal
      summarizeValueAfter={2}
      onChange={async (v, _, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(skill.id, true);
        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { educations: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was a server error updating the educations for the skill with ID '${skill.id}'.`,
            {
              skill: skill.id,
              educations: v,
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
            "There was a client error updating the educations for the skill with ID " +
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

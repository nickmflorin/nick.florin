"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateEducation } from "~/actions-v2/educations/update-education";

import type * as types from "~/components/tables-v2/types";
import type { EducationsTableColumn, EducationsTableModel } from "~/features/educations/types";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

interface SkillsCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const SkillsCell = ({ education, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useState(education.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(education.skills.map(exp => exp.id));
  }, [education.skills]);

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
        table.setRowLoading(education.id, true);

        let response: Awaited<ReturnType<typeof updateEducation>> | undefined = undefined;
        try {
          response = await updateEducation(education.id, { skills: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the skills for the education with " +
              `ID '${education.id}'.`,
            {
              education: education.id,
              skills: v,
            },
          );
          item?.setLoading(false);
          table.setRowLoading(education.id, false);
          return toast.error("There was an error updating the education.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the skills for the education with ID " +
              `'${education.id}': ${error.code}`,
            { education, skills: v },
          );
          item?.setLoading(false);
          table.setRowLoading(education.id, false);
          return toast.error("There was an error updating the education.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(education.id, false);
        });
      }}
    />
  );
};

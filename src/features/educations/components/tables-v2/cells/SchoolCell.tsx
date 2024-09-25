"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateEducation } from "~/actions-v2/educations/update-education";

import type * as types from "~/components/tables-v2/types";
import { type EducationsTableModel, type EducationsTableColumn } from "~/features/educations/types";
import { ClientSchoolSelect } from "~/features/schools/components/input/ClientSchoolSelect";

interface SchoolCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const SchoolCell = ({ education, table }: SchoolCellProps): JSX.Element => {
  const [value, setValue] = useState(education.school.id);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(education.school.id);
  }, [education.school]);

  return (
    <ClientSchoolSelect
      visibility="admin"
      inputClassName="w-full"
      behavior="single"
      value={value}
      inPortal
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(education.id, true);
        let response: Awaited<ReturnType<typeof updateEducation>> | undefined = undefined;
        try {
          response = await updateEducation(education.id, { school: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the school for the education with " +
              `ID '${education.id}'.`,
            { education, school: v },
          );
          item?.setLoading(false);
          table.setRowLoading(education.id, false);
          return toast.error("There was an error updating the education.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the school for the education with ID " +
              `'${education.id}': ${error.code}`,
            { education, school: v },
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

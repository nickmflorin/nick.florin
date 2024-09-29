"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type Degree } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateEducation } from "~/actions/educations/update-education";

import type * as types from "~/components/tables/types";
import { DegreeSelect } from "~/features/educations/components/input/DegreeSelect";
import { type EducationsTableModel, type EducationsTableColumn } from "~/features/educations/types";

interface DegreeCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const DegreeCell = ({ education, table }: DegreeCellProps): JSX.Element => {
  const [value, setValue] = useState<Degree>(education.degree);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(education.degree);
  }, [education.degree]);

  return (
    <DegreeSelect
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
          response = await updateEducation(education.id, { degree: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the degree for the education with " +
              `ID '${education.id}'.`,
            { education, degree: v },
          );
          item?.setLoading(false);
          table.setRowLoading(education.id, false);
          return toast.error("There was an error updating the education.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the degree for the education with ID " +
              `'${education.id}': ${error.code}`,
            { education, degree: v },
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

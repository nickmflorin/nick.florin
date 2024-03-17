"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { logger } from "~/application/logger";
import { type ApiEducation, type School } from "~/prisma/model";
import { updateEducation } from "~/actions/update-education";
import { isApiClientErrorJson } from "~/api";
import { SchoolSelect } from "~/components/input/select/SchoolSelect";

interface SchoolCellProps {
  readonly education: ApiEducation<{ details: true }>;
  readonly schools: School[];
  readonly table: types.TableInstance<ApiEducation<{ details: true }>>;
}

export const SchoolCell = ({ education, schools, table }: SchoolCellProps): JSX.Element => {
  const [value, setValue] = useState(education.schoolId);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(education.schoolId);
  }, [education.schoolId]);

  return (
    <SchoolSelect
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      data={schools}
      value={value}
      onChange={async v => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(education.id, true);
        let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
        try {
          response = await updateEducation(education.id, { school: v });
        } catch (e) {
          logger.error(`There was a server error updating the education's company:\n${e}`, {
            error: e,
            education: education.id,
            company: v,
          });
          toast.error("There was an error updating the education.");
        } finally {
          table.setRowLoading(education.id, false);
        }
        if (response && isApiClientErrorJson(response)) {
          logger.error("There was a client error updating the education's company.", {
            error: response,
            education: education.id,
            company: v,
          });
          toast.error("There was an error updating the education.");
        } else {
          /* Refresh the page state from the server.  This is not entirely necessary, but will
             revert any changes that were made if the request fails. */
          transition(() => {
            router.refresh();
          });
        }
      }}
    />
  );
};

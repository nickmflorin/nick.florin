"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";
import { type ApiEducation } from "~/prisma/model";

import { updateEducation } from "~/actions/mutations/educations";
import { isApiClientErrorJson } from "~/api";

import type * as types from "~/components/tables/types";
import { SchoolSelect } from "~/features/schools/components/input/SchoolSelect";

interface SchoolCellProps {
  readonly education: ApiEducation<["details", "skills"]>;
  readonly table: types.CellTableInstance<ApiEducation<["details", "skills"]>>;
}

export const SchoolCell = ({ education, table }: SchoolCellProps): JSX.Element => {
  const [value, setValue] = useState(education.schoolId);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(education.schoolId);
  }, [education.schoolId]);

  return (
    <SchoolSelect
      inputClassName="w-full"
      behavior="single"
      isClearable
      menuClassName="max-h-[260px]"
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
        }
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default SchoolCell;

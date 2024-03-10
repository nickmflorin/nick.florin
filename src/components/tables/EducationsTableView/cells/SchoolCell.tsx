"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiEducation, type School } from "~/prisma/model";
import { updateEducation } from "~/actions/update-education";
import { SchoolSelect } from "~/components/input/select/SchoolSelect";

interface SchoolCellProps {
  readonly education: ApiEducation;
  readonly schools: School[];
}

export const SchoolCell = ({ education, schools }: SchoolCellProps): JSX.Element => {
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
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);
        try {
          await updateEducation(education.id, { school: v });
        } catch (e) {
          logger.error(e);
          toast.error("There was an error updating the education.");
        } finally {
          item.setLoading(false);
        }
        /* Refresh the page state from the server.  This is not entirely necessary, but will
           revert any changes that were made if the request fails. */
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

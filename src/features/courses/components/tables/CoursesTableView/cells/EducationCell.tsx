"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiCourse } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateCourse } from "~/actions/mutations/courses";
import { isApiClientErrorJson } from "~/api";

import type { CellTableInstance } from "~/components/tables/types";
import { ClientEducationSelect } from "~/features/educations/components/input/ClientEducationSelect";

interface EducationCellProps {
  readonly course: ApiCourse<["education", "skills"]>;
  readonly table: CellTableInstance<ApiCourse<["education", "skills"]>>;
}

export const EducationCell = ({ course, table }: EducationCellProps): JSX.Element => {
  const [value, setValue] = useState(course.education.id);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(course.education.id);
  }, [course.education]);

  return (
    <ClientEducationSelect
      visibility="admin"
      inputClassName="w-full"
      menuClassName="max-h-[260px]"
      behavior="single"
      useAbbreviatedOptionLabels={false}
      value={value}
      onChange={async v => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(course.id, true);

        let response: Awaited<ReturnType<typeof updateCourse>> | null = null;
        try {
          response = await updateCourse(course.id, { education: v });
        } catch (e) {
          logger.error(
            `There was an error updating the education for the course with ID '${course.id}':\n${e}`,
            {
              error: e,
              course: course.id,
              education: v,
            },
          );
          toast.error("There was an error updating the course.");
        } finally {
          table.setRowLoading(course.id, false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the experiences for the course with ID " +
              `'${course.id}': ${response.code}`,
            {
              response,
              course: course.id,
              experiences: v,
            },
          );
          toast.error("There was an error updating the course.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default EducationCell;

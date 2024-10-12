"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateCourse } from "~/actions/courses/update-course";

import type * as types from "~/components/tables/types";
import { type CoursesTableModel, type CoursesTableColumn } from "~/features/courses/types";
import { ClientEducationSelect } from "~/features/educations/components/input/ClientEducationSelect";

interface EducationCellProps {
  readonly course: CoursesTableModel;
  readonly table: types.CellDataTableInstance<CoursesTableModel, CoursesTableColumn>;
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
      includes={[]}
      inputClassName="w-full"
      behavior="single"
      value={value}
      inPortal
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(course.id, true);
        let response: Awaited<ReturnType<typeof updateCourse>> | undefined = undefined;
        try {
          response = await updateCourse(course.id, { education: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the education for the course with " +
              `ID '${course.id}'.`,
            { course, education: v },
          );
          item?.setLoading(false);
          table.setRowLoading(course.id, false);
          return toast.error("There was an error updating the course.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the education for the course with ID " +
              `'${course.id}': ${error.code}`,
            { course, education: v },
          );
          item?.setLoading(false);
          table.setRowLoading(course.id, false);
          return toast.error("There was an error updating the course.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(course.id, false);
        });
      }}
    />
  );
};

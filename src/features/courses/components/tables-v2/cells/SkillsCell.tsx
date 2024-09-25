"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateCourse } from "~/actions-v2/courses/update-course";

import type * as types from "~/components/tables-v2/types";
import type { CoursesTableColumn, CoursesTableModel } from "~/features/courses/types";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

interface SkillsCellProps {
  readonly course: CoursesTableModel;
  readonly table: types.CellDataTableInstance<CoursesTableModel, CoursesTableColumn>;
}

export const SkillsCell = ({ course, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useState(course.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(course.skills.map(exp => exp.id));
  }, [course.skills]);

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
        table.setRowLoading(course.id, true);

        let response: Awaited<ReturnType<typeof updateCourse>> | undefined = undefined;
        try {
          response = await updateCourse(course.id, { skills: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the skills for the course with " +
              `ID '${course.id}'.`,
            {
              course: course.id,
              skills: v,
            },
          );
          item?.setLoading(false);
          table.setRowLoading(course.id, false);
          return toast.error("There was an error updating the course.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the skills for the course with ID " +
              `'${course.id}': ${error.code}`,
            { course, skills: v },
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

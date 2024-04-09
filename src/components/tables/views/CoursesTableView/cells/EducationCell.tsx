"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiCourse } from "~/prisma/model";
import { updateCourse } from "~/actions/mutations/courses";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";
import type { TableInstance } from "~/components/tables/types";

interface EducationCellProps {
  readonly course: ApiCourse<["education"]>;
  readonly table: TableInstance<ApiCourse<["education"]>>;
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
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      options={{ isMulti: false }}
      useAbbreviatedOptionLabels={false}
      value={value}
      onChange={async v => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(course.id, true);
        try {
          await updateCourse(course.id, { education: v });
        } catch (e) {
          const logger = (await import("~/application/logger")).logger;
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
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default EducationCell;

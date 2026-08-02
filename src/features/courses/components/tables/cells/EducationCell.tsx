'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateCourse } from '~/actions/courses/update-course';

import type * as types from '~/components/tables/types';
import { type CoursesTableColumn, type CoursesTableModel } from '~/features/courses/types';
import { ClientEducationSelect } from '~/features/educations/components/input/ClientEducationSelect';

interface EducationCellProps {
  readonly course: CoursesTableModel;
  readonly table: types.CellDataTableInstance<CoursesTableModel, CoursesTableColumn>;
}

export const EducationCell = ({ course, table }: EducationCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(course.education.id);
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ClientEducationSelect
      behavior='single'
      includes={[]}
      inputClassName='w-full'
      isInPortal
      onChange={(v, { item }) => {
        transition(async () => {
          setValue(v);
          item?.setLoading(true);
          table.setRowLoading(course.id, true);
          let response: Awaited<ReturnType<typeof updateCourse>> | undefined = undefined;
          try {
            response = await updateCourse(course.id, { education: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the education for the course with ' +
                `ID '${course.id}'.`,
              { course, education: v },
            );
            item?.setLoading(false);
            table.setRowLoading(course.id, false);
            toast.error('There was an error updating the course.');
            return;
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              'There was a client error updating the education for the course with ID ' +
                `'${course.id}': ${error.code}`,
              { course, education: v },
            );
            item?.setLoading(false);
            table.setRowLoading(course.id, false);
            toast.error('There was an error updating the course.');
            return;
          }
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(course.id, false);
        });
      }}
      value={value}
      visibility='admin'
    />
  );
};

'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useOptimistic, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { updateCourse } from '~/actions/courses/update-course';

import type * as types from '~/components/tables/types';
import { type CoursesTableColumn, type CoursesTableModel } from '~/features/courses/types';
import { ClientSkillsSelect } from '~/features/skills/components/input/ClientSkillsSelect';

interface SkillsCellProps {
  readonly course: CoursesTableModel;
  readonly table: types.CellDataTableInstance<CoursesTableModel, CoursesTableColumn>;
}

export const SkillsCell = ({ course, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useOptimistic(course.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ClientSkillsSelect
      behavior='multi'
      inputClassName='w-full'
      isClearable
      isInPortal
      onChange={(v, { item }) => {
        transition(async () => {
          setValue(v);
          item?.setLoading(true);
          table.setRowLoading(course.id, true);

          let response: Awaited<ReturnType<typeof updateCourse>> | undefined = undefined;
          try {
            response = await updateCourse(course.id, { skills: v });
          } catch (e) {
            logger.errorUnsafe(
              e,
              'There was a server error updating the skills for the course with ' +
                `ID '${course.id}'.`,
              {
                course: course.id,
                skills: v,
              },
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
              'There was a client error updating the skills for the course with ID ' +
                `'${course.id}': ${error.code}`,
              { course, skills: v },
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
      summarizeValueAfter={2}
      value={value}
      visibility='admin'
    />
  );
};

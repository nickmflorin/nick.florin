'use client';
import { type JSX } from 'react';

import { type BrandCourse } from '~/database/model';

import { BadgeCollection } from '~/components/badges/BadgeCollection';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { type ComponentProps } from '~/components/types';

import { CourseBadge } from './CourseBadge';

export interface CoursesProps extends ComponentProps {
  readonly courses: BrandCourse[];
}

/**
 * @deprecated
 */
export const Courses = ({ courses, ...props }: CoursesProps): JSX.Element | null => {
  const { ids, open } = useDrawers();
  if (courses.length === 0) {
    return null;
  }
  return (
    <BadgeCollection {...props}>
      {courses.map(course => (
        <CourseBadge
          course={course}
          key={course.id}
          onClick={() => open(ids.VIEW_COURSE, { courseId: course.id })}
        />
      ))}
    </BadgeCollection>
  );
};

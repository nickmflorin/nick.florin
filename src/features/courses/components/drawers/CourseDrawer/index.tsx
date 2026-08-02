import { type JSX } from 'react';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { ContextDrawer } from '~/components/drawers/ContextDrawer';
import { useCourse } from '~/hooks/api';

import { CourseDrawerContent } from './CourseDrawerContent';

export interface CourseDrawerProps extends ExtendingDrawerProps {
  readonly courseId: string;
}

export const CourseDrawer = ({ courseId }: CourseDrawerProps): JSX.Element => {
  const { data, error, isLoading } = useCourse(courseId, {
    keepPreviousData: true,
    query: { includes: ['education', 'skills'], visibility: 'public' },
  });

  return (
    <ContextDrawer>
      <ApiResponseState data={data} error={error} isLoading={isLoading}>
        {course => <CourseDrawerContent course={course} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

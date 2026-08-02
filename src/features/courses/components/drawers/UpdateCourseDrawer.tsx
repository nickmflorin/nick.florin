import { type JSX } from 'react';

import { type BrandCourse } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useCourseForm } from '~/features/courses/components/forms/hooks';
import { UpdateCourseForm } from '~/features/courses/components/forms/UpdateCourseF';
import { useCourse } from '~/hooks/api';

interface UpdateCourseDrawerProps extends ExtendingDrawerProps {
  readonly courseId: string;
  readonly eager: Pick<BrandCourse, 'name'>;
}

export const UpdateCourseDrawer = ({
  courseId,
  eager,
  onClose,
}: UpdateCourseDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useCourse(courseId, {
    keepPreviousData: true,
    query: { includes: ['education', 'skills'], visibility: 'admin' },
  });
  const form = useCourseForm();

  return (
    <DrawerForm eagerTitle={eager.name} form={form} titleField='name'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {course => (
          <UpdateCourseForm course={course} form={form} onCancel={onClose} onSuccess={onClose} />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

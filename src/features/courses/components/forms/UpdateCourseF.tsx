'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect, useEffectEvent, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiCourse } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateCourse } from '~/actions/courses/update-course';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { CourseForm, type CourseFormProps } from './CourseForm';

export interface UpdateCourseFormProps extends Omit<CourseFormProps, 'action'> {
  readonly course: ApiCourse<['education', 'skills']>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateCourseForm = ({
  course,
  form,
  onCancel,
  onSuccess,
  ...props
}: UpdateCourseFormProps): JSX.Element => {
  const updateCourseWithId = updateCourse.bind(null, course.id);
  const router = useRouter();
  const [pending, transition] = useTransition();

  /* The form is repopulated only when a different course is being edited.  Keying the effect on
     the identifier rather than the course itself means a background revalidation of the same
     course never discards values the user is in the middle of editing. */
  const setCourseFormValues = useEffectEvent(() => {
    form.setValues({
      ...course,
      education: course.education.id,
      name: course.name,
      shortName: course.shortName,
      skills: course.skills.map(s => s.id),
      slug: course.slug,
    });
  });

  useEffect(() => {
    setCourseFormValues();
  }, [course.id]);

  return (
    <CourseForm
      {...props}
      action={async (data, formInstance) => {
        let response: Awaited<ReturnType<typeof updateCourseWithId>> | null = null;
        try {
          response = await updateCourseWithId(data);
        } catch (e) {
          logger.errorUnsafe(e, `There was an error updating the course with ID '${course.id}'.`, {
            course,
            data,
          });
          return toast.error('There was an error updating the course.');
        }
        const { error } = response;
        if (error) {
          return formInstance.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.();
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      form={form}
      isLoading={pending}
    />
  );
};

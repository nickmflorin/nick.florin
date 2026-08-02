'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type Course } from '~/database/model';
import { logger } from '~/internal/logger';

import { createCourse } from '~/actions/courses/create-course';

import { ButtonFooter } from '~/components/structural/ButtonFooter';

import { CourseForm, type CourseFormProps } from './CourseForm';

export interface CreateCourseFormProps extends Omit<CourseFormProps, 'action'> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Course) => void;
}

export const CreateCourseForm = ({
  form,
  onCancel,
  onSuccess,
  ...props
}: CreateCourseFormProps): JSX.Element => {
  const router = useRouter();
  const [pending, transition] = useTransition();

  return (
    <CourseForm
      {...props}
      action={async (data, formInstance) => {
        let response: Awaited<ReturnType<typeof createCourse>> | null = null;
        try {
          response = await createCourse(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the course'.", {
            data,
          });
          return toast.error('There was an error creating the course.');
        }
        const { data: course, error } = response;
        if (error) {
          return formInstance.handleApiError(error);
        }
        transition(() => {
          router.refresh();
          onSuccess?.(course);
        });
      }}
      footer={<ButtonFooter onCancel={onCancel} submitText='Save' />}
      form={form}
      isLoading={pending}
    />
  );
};

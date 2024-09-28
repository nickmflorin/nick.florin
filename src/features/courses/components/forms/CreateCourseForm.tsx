"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Course } from "~/database/model";
import { logger } from "~/internal/logger";

import { createCourse } from "~/actions-v2/courses/create-course";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { CourseForm, type CourseFormProps } from "./CourseForm";

export interface CreateCourseFormProps extends Omit<CourseFormProps, "action"> {
  readonly onSuccess?: (m: Course) => void;
  readonly onCancel?: () => void;
}

export const CreateCourseForm = ({
  onCancel,
  onSuccess,
  form,
  ...props
}: CreateCourseFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  return (
    <CourseForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={form}
      action={async (data, form) => {
        let response: Awaited<ReturnType<typeof createCourse>> | null = null;
        try {
          response = await createCourse(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the course'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the course.");
        }
        const { error, data: course } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(course);
        });
      }}
    />
  );
};

export default CreateCourseForm;

"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Course } from "~/database/model";

import { createCourse } from "~/actions/mutations/courses";
import { isApiClientErrorJson } from "~/api";

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
        const response = await createCourse(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          toast.success("The project was successfully created.");
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateCourseForm;

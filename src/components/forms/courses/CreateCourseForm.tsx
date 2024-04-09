"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Course } from "~/prisma/model";
import { createCourse } from "~/actions/mutations/courses";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import {
  CourseForm,
  type CourseFormProps,
  type CourseFormValues,
  CourseFormSchema,
} from "./CourseForm";

export interface CreateCourseFormProps extends Omit<CourseFormProps, "form" | "action"> {
  readonly onSuccess?: (m: Course) => void;
  readonly onCancel?: () => void;
}

export const CreateCourseForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateCourseFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  const { setValues, ...form } = useForm<CourseFormValues>({
    schema: CourseFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
    },
  });

  return (
    <CourseForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
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

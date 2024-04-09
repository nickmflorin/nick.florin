"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Course } from "~/prisma/model";
import { updateCourse } from "~/actions/mutations/courses";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { useForm } from "../generic/hooks/use-form";

import {
  CourseForm,
  type CourseFormProps,
  type CourseFormValues,
  CourseFormSchema,
} from "./CourseForm";

export interface UpdateCourseFormProps extends Omit<CourseFormProps, "form" | "action"> {
  readonly course: Course;
  readonly onCancel?: () => void;
}

export const UpdateCourseForm = ({
  course,
  onCancel,
  ...props
}: UpdateCourseFormProps): JSX.Element => {
  const updateCourseWithId = updateCourse.bind(null, course.id);
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

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    setValues({
      ...course,
      shortName: course.shortName,
      name: course.name,
      slug: course.slug,
      education: "",
      // TODO: Use actual data once established.
      skills: [],
    });
  }, [course, setValues]);

  return (
    <CourseForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await updateCourseWithId(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default UpdateCourseForm;

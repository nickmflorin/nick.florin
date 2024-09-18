"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiCourse } from "~/database/model";

import { updateCourse } from "~/actions/mutations/courses";
import { isApiClientErrorJson } from "~/api";

import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { CourseForm, type CourseFormProps } from "./CourseForm";

export interface UpdateCourseFormProps extends Omit<CourseFormProps, "action"> {
  readonly course: ApiCourse<["education", "skills"]>;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

export const UpdateCourseForm = ({
  course,
  onCancel,
  onSuccess,
  form,
  ...props
}: UpdateCourseFormProps): JSX.Element => {
  const updateCourseWithId = updateCourse.bind(null, course.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    form.setValues({
      ...course,
      shortName: course.shortName,
      name: course.name,
      slug: course.slug,
      education: course.education.id,
      skills: course.skills.map(s => s.id),
    });
  }, [course, form.setValues]);

  return (
    <CourseForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={form}
      action={async (data, form) => {
        const response = await updateCourseWithId(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          transition(() => {
            refresh();
            onSuccess?.();
          });
        }
      }}
    />
  );
};

export default UpdateCourseForm;

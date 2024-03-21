"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type School } from "~/prisma/model";
import { updateSchool } from "~/actions/update-school";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { useDeepEqualEffect } from "~/hooks";

import { useForm } from "../generic/hooks/use-form";

import {
  SchoolForm,
  type SchoolFormProps,
  type SchoolFormValues,
  SchoolFormSchema,
} from "./SchoolForm";

export interface UpdateSchoolFormProps extends Omit<SchoolFormProps, "form" | "action"> {
  readonly school: School;
  readonly onCancel?: () => void;
}

export const UpdateSchoolForm = ({
  school,
  onCancel,
  ...props
}: UpdateSchoolFormProps): JSX.Element => {
  const updateSchoolWithId = updateSchool.bind(null, school.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  const { setValues, ...form } = useForm<SchoolFormValues>({
    schema: SchoolFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      description: "",
      websiteUrl: "",
      logoImageUrl: "",
      city: "",
      state: "",
    },
  });

  // Prevents the form from resetting when an error occurs.
  useDeepEqualEffect(() => {
    setValues({
      ...school,
      shortName: school.shortName ?? "",
      description: school.description ?? "",
      websiteUrl: school.websiteUrl ?? "",
      logoImageUrl: school.logoImageUrl ?? "",
    });
  }, [school, setValues]);

  return (
    <SchoolForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      form={{ ...form, setValues }}
      action={async (data, form) => {
        const response = await updateSchoolWithId(data);
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

export default UpdateSchoolForm;

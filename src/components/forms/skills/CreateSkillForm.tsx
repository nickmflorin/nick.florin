"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type Skill } from "~/prisma/model";

import { createSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";

import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { SkillForm, type SkillFormProps } from "./SkillForm";

export interface CreateSkillFormProps extends Omit<SkillFormProps, "action"> {
  readonly onCancel?: () => void;
  readonly onSuccess?: (m: Skill) => void;
}

export const CreateSkillForm = ({
  onCancel,
  onSuccess,
  ...props
}: CreateSkillFormProps): JSX.Element => {
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  return (
    <SkillForm
      {...props}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      isLoading={pending}
      action={async (data, form) => {
        const response = await createSkill(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          onSuccess?.(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default CreateSkillForm;

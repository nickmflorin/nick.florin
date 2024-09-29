"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type Skill } from "~/database/model";
import { logger } from "~/internal/logger";

import { createSkill } from "~/actions/skills/create-skill";

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
        let response: Awaited<ReturnType<typeof createSkill>> | null = null;
        try {
          response = await createSkill(data);
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the skill'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          return toast.error("There was an error creating the skill.");
        }
        const { error, data: skill } = response;
        if (error) {
          return form.handleApiError(error);
        }
        transition(() => {
          refresh();
          onSuccess?.(skill);
        });
      }}
    />
  );
};

export default CreateSkillForm;

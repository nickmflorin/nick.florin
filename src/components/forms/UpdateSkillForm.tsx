"use client";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { z } from "zod";

import { type ApiSkill, type ApiEducation, type ApiExperience } from "~/prisma/model";
import { updateSkill } from "~/actions/updateSkill";
import { EducationSelect } from "~/components/input/select/EducationSelect";
import { ExperienceSelect } from "~/components/input/select/ExperienceSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";

import { Form, type FormProps } from "./Form";
import { useForm } from "./useForm";

export const UpdateSkillSchema = z.object({
  label: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  experiences: z.array(z.string()),
  educations: z.array(z.string()),
  includeInTopSkills: z.boolean(),
  experience: z.number().nullable(),
  visible: z.boolean(),
});

export type UpdateSkillFormValues = z.infer<typeof UpdateSkillSchema>;

export interface UpdateSkillFormProps
  extends Omit<FormProps<UpdateSkillFormValues>, "children" | "form" | "onSubmit" | "action"> {
  readonly skill: ApiSkill;
  readonly educations: ApiEducation[];
  readonly experiences: ApiExperience[];
}

export const UpdateSkillForm = ({
  skill,
  educations,
  experiences,
  ...props
}: UpdateSkillFormProps): JSX.Element => {
  const updateSkillWithId = updateSkill.bind(null, skill.id);
  const { refresh } = useRouter();
  const [pending, transition] = useTransition();

  const { setValues, ...form } = useForm<UpdateSkillFormValues>({
    schema: UpdateSkillSchema,
    defaultValues: {
      label: "",
      slug: "",
      description: "",
      experiences: [],
      educations: [],
      includeInTopSkills: false,
      experience: null,
      visible: true,
    },
  });

  useEffect(() => {
    setValues({
      label: skill.label,
      slug: skill.slug,
      experiences: skill.experiences.map(exp => exp.id),
      educations: skill.educations.map(edu => edu.id),
      includeInTopSkills: skill.includeInTopSkills,
      experience: skill.experience,
      visible: skill.visible,
      description: skill.description,
    });
  }, [skill, setValues]);

  return (
    <Form
      {...props}
      form={{ ...form, setValues }}
      isLoading={pending}
      contentClassName="gap-[12px]"
      submitButtonType="submit"
      action={async data => {
        await updateSkillWithId(data);
        transition(() => {
          refresh();
        });
      }}
    >
      <Form.Field name="label" label="Label" form={{ ...form, setValues }}>
        <TextInput className="w-full" {...form.register("label")} />
      </Form.Field>
      <Form.Field name="slug" label="Slug" form={{ ...form, setValues }}>
        <TextInput className="w-full" {...form.register("slug")} />
      </Form.Field>
      <Form.Field name="description" label="Description" form={{ ...form, setValues }}>
        <TextArea className="w-full" {...form.register("description")} />
      </Form.Field>
      <Form.ControlledField name="experiences" label="Experiences" form={{ ...form, setValues }}>
        {({ value, onChange }) => (
          <ExperienceSelect
            inputClassName="w-full"
            menuClassName="max-h-[260px]"
            data={experiences}
            value={value}
            onChange={onChange}
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField name="educations" label="Educations" form={{ ...form, setValues }}>
        {({ value, onChange }) => (
          <EducationSelect
            inputClassName="w-full"
            menuClassName="max-h-[260px]"
            data={educations}
            value={value}
            onChange={onChange}
          />
        )}
      </Form.ControlledField>
    </Form>
  );
};

export default UpdateSkillForm;

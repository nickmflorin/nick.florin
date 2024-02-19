import { z } from "zod";

import { type ApiEducation } from "~/prisma/model";
import { EducationSelect } from "~/components/input/select/EducationSelect";

import { Form, type FormProps } from "./Form";
import { useForm } from "./useForm";

export const UpdateSkillSchema = z.object({
  label: z.string(),
  slug: z.string(),
  experiences: z.array(z.string()),
  educations: z.array(z.string()),
  includeInTopSkills: z.boolean(),
  experience: z.number().nullable(),
  visible: z.boolean(),
});

export type UpdateSkillFormValues = z.infer<typeof UpdateSkillSchema>;

export interface UpdateSkillFormProps extends Omit<FormProps<UpdateSkillFormValues>, "children"> {
  readonly skillId: string;
}

export const UpdateSkillForm = ({ skillId, ...props }: UpdateSkillFormProps): JSX.Element => {
  const form = useForm<UpdateSkillFormValues>({
    schema: UpdateSkillSchema,
    defaultValues: {
      label: "",
      slug: "",
      experiences: [],
      educations: [],
      includeInTopSkills: false,
      experience: null,
      visible: true,
    },
  });

  return (
    <Form {...props} form={form}>
      <Form.ControlledField name="educations" label="Educations" form={form}>
        {({ value, onChange }) => (
          <EducationSelect
            inputClassName="w-[300px]"
            menuClassName="max-h-[260px]"
            data={[] as ApiEducation[]}
            value={value}
            onChange={onChange}
          />
        )}
      </Form.ControlledField>
    </Form>
  );
};

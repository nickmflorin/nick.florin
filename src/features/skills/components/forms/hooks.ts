import { SkillSchema } from "~/actions-v2/schemas";

import { useForm } from "~/components/forms/hooks/use-form";

export const useSkillForm = () =>
  useForm({
    schema: SkillSchema.required(),
    defaultValues: {
      label: "",
      slug: "",
      description: "",
      experiences: [],
      educations: [],
      categories: [],
      courses: [],
      projects: [],
      repositories: [],
      programmingDomains: [],
      programmingLanguages: [],
      includeInTopSkills: false,
      experience: null,
      visible: true,
    },
  });

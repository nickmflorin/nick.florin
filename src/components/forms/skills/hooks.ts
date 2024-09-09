import { SkillSchema } from "~/api/schemas";

import { useForm } from "~/components/forms/generic/hooks/use-form";

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

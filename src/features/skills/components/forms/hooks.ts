import { SkillSchema } from "~/actions/schemas";

import { useForm } from "~/components/forms-v2/hooks/use-form";

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
      highlighted: false,
      experience: null,
      visible: true,
      prioritized: false,
    },
  });

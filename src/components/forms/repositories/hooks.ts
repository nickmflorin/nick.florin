import { type ApiRepository } from "~/prisma/model";
import { useForm } from "~/components/forms/generic/hooks/use-form";

import { RepositoryFormSchema } from "./schema";

export const useRepositoryForm = (repository?: Partial<ApiRepository<["skills", "projects"]>>) =>
  useForm({
    schema: RepositoryFormSchema,
    defaultValues: {
      highlighted: repository?.highlighted ?? false,
      visible: repository?.visible ?? false,
      slug: repository?.slug ?? "",
      description: repository?.description ?? "",
      skills: repository?.skills
        ? repository.skills.map(sk => ({ id: sk.id, value: sk.id, label: sk.label }))
        : [],
      projects: repository?.projects ? repository.projects.map(p => p.id) : [],
    },
  });

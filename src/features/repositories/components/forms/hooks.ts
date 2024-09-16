import { type ApiRepository } from "~/prisma/model";

import { useForm } from "~/components/forms/hooks/use-form";

import { RepositoryFormSchema } from "./schema";

export const useRepositoryForm = (repository?: Partial<ApiRepository<["skills", "projects"]>>) =>
  useForm({
    schema: RepositoryFormSchema,
    defaultValues: {
      highlighted: repository?.highlighted ?? false,
      visible: repository?.visible ?? false,
      slug: repository?.slug ?? "",
      npmPackageName: repository?.npmPackageName ?? "",
      description: repository?.description ?? "",
      skills: repository?.skills ? repository.skills.map(sk => sk.id) : [],
      projects: repository?.projects ? repository.projects.map(p => p.id) : [],
    },
  });

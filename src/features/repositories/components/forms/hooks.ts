import { type ApiRepository } from "~/database/model";

import { useForm } from "~/components/forms-v2/hooks/use-form";

import { RepositoryFormSchema } from "./schema";

export const useRepositoryForm = (repository?: Partial<ApiRepository<["skills", "projects"]>>) =>
  useForm({
    schema: RepositoryFormSchema,
    defaultValues: {
      highlighted: repository?.highlighted ?? false,
      visible: repository?.visible ?? false,
      startDate: repository?.startDate ?? new Date(),
      slug: repository?.slug ?? "",
      npmPackageName: repository?.npmPackageName ?? "",
      description: repository?.description ?? "",
      skills: repository?.skills ? repository.skills.map(sk => sk.id) : [],
      projects: repository?.projects ? repository.projects.map(p => p.id) : [],
    },
  });

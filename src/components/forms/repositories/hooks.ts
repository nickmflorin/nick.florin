import { type ApiRepository } from "~/prisma/model";
import { RepositorySchema } from "~/api/schemas";
import { useForm } from "~/components/forms/generic/hooks/use-form";

export const useRepositoryForm = (repository?: Partial<ApiRepository<["skills", "projects"]>>) =>
  useForm({
    schema: RepositorySchema.required(),
    defaultValues: {
      visible: repository?.visible ?? false,
      slug: repository?.slug ?? "",
      description: repository?.description ?? "",
      skills: repository?.skills ? repository.skills.map(sk => sk.id) : [],
      projects: repository?.projects ? repository.projects.map(p => p.id) : [],
    },
  });

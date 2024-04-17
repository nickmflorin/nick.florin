import { isUuid } from "~/lib/typeguards";
import type { BrandRepository } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useRepositoryForm } from "~/components/forms/repositories/hooks";
import { UpdateRepositoryForm } from "~/components/forms/repositories/UpdateRepositoryForm";
import { useRepository } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateRepositoryDrawerProps
  extends ExtendingDrawerProps<{
    readonly repositoryId: string;
    readonly eager: Pick<BrandRepository, "slug">;
  }> {}

export const UpdateRepositoryDrawer = ({
  repositoryId,
  eager,
}: UpdateRepositoryDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useRepository(
    isUuid(repositoryId) ? repositoryId : null,
    {
      includes: ["projects", "skills"],
      visibility: "admin",
      keepPreviousData: true,
    },
  );
  const form = useRepositoryForm(eager);

  return (
    <DrawerForm form={form} titleField="slug" eagerTitle={eager.slug}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {repository => <UpdateRepositoryForm form={form} repository={repository} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateRepositoryDrawer;

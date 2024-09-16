import { isUuid } from "~/lib/typeguards";
import type { BrandRepository } from "~/prisma/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useRepositoryForm } from "~/features/repositories/components/forms/hooks";
import { UpdateRepositoryForm } from "~/features/repositories/components/forms/UpdateRepositoryForm";
import { useRepository } from "~/hooks";

interface UpdateRepositoryDrawerProps extends ExtendingDrawerProps {
  readonly repositoryId: string;
  readonly eager: Pick<BrandRepository, "slug">;
}

export const UpdateRepositoryDrawer = ({
  repositoryId,
  eager,
}: UpdateRepositoryDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useRepository(
    isUuid(repositoryId) ? repositoryId : null,
    {
      query: { includes: ["projects", "skills"], visibility: "admin" },
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

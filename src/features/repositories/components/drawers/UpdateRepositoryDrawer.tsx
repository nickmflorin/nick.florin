import type { BrandRepository } from "~/database/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useRepositoryForm } from "~/features/repositories/components/forms/hooks";
import { UpdateRepositoryForm } from "~/features/repositories/components/forms/UpdateRepositoryForm";
import { useRepository } from "~/hooks/api-v2";

interface UpdateRepositoryDrawerProps extends ExtendingDrawerProps {
  readonly repositoryId: string;
  readonly eager: Pick<BrandRepository, "slug">;
}

export const UpdateRepositoryDrawer = ({
  repositoryId,
  eager,
  onClose,
}: UpdateRepositoryDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useRepository(repositoryId, {
    query: { includes: ["projects", "skills"], visibility: "admin" },
    keepPreviousData: true,
  });
  const form = useRepositoryForm(eager);

  return (
    <DrawerForm form={form} titleField="slug" eagerTitle={eager.slug}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {repository => (
          <UpdateRepositoryForm
            form={form}
            repository={repository}
            onSuccess={() => onClose()}
            onCancel={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateRepositoryDrawer;

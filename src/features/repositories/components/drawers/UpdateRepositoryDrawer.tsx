import { type JSX } from 'react';

import { type BrandRepository } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useRepositoryForm } from '~/features/repositories/components/forms/hooks';
import { UpdateRepositoryForm } from '~/features/repositories/components/forms/UpdateRepositoryForm';
import { useRepository } from '~/hooks/api';

interface UpdateRepositoryDrawerProps extends ExtendingDrawerProps {
  readonly eager: Pick<BrandRepository, 'slug'>;
  readonly repositoryId: string;
}

export const UpdateRepositoryDrawer = ({
  eager,
  onClose,
  repositoryId,
}: UpdateRepositoryDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useRepository(repositoryId, {
    keepPreviousData: true,
    query: { includes: ['projects', 'skills'], visibility: 'admin' },
  });
  const form = useRepositoryForm(eager);

  return (
    <DrawerForm eagerTitle={eager.slug} form={form} titleField='slug'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {repository => (
          <UpdateRepositoryForm
            form={form}
            onCancel={() => onClose()}
            onSuccess={() => onClose()}
            repository={repository}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

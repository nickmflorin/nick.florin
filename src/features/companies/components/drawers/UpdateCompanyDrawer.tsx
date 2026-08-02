import { type JSX } from 'react';

import { type BrandCompany } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useCompanyForm } from '~/features/companies/components/forms/hooks';
import { UpdateCompanyForm } from '~/features/companies/components/forms/UpdateCompanyForm';
import { useCompany } from '~/hooks/api';

interface UpdateCompanyDrawerProps extends ExtendingDrawerProps {
  readonly companyId: string;
  readonly eager: Pick<BrandCompany, 'name'>;
}

export const UpdateCompanyDrawer = ({
  companyId,
  eager,
  onClose,
}: UpdateCompanyDrawerProps): JSX.Element => {
  const form = useCompanyForm();

  const { data, error, isLoading, isValidating } = useCompany(companyId, {
    keepPreviousData: true,
    query: { includes: [], visibility: 'admin' },
  });
  return (
    <DrawerForm eagerTitle={eager.name} form={form} titleField='name'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {company => (
          <UpdateCompanyForm
            company={company}
            form={form}
            onCancel={() => onClose()}
            onSuccess={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

import { type JSX } from 'react';

import { type BrandSchool } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useSchoolForm } from '~/features/schools/components/forms/hooks';
import { UpdateSchoolForm } from '~/features/schools/components/forms/UpdateSchoolForm';
import { useSchool } from '~/hooks/api';

interface UpdateSchoolDrawerProps extends ExtendingDrawerProps {
  readonly eager: Pick<BrandSchool, 'name'>;
  readonly schoolId: string;
}

export const UpdateSchoolDrawer = ({
  eager,
  onClose,
  schoolId,
}: UpdateSchoolDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useSchool(schoolId, {
    keepPreviousData: true,
    query: { includes: [], visibility: 'admin' },
  });
  const form = useSchoolForm();

  return (
    <DrawerForm eagerTitle={eager.name} form={form} titleField='name'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {school => (
          <UpdateSchoolForm form={form} onCancel={onClose} onSuccess={onClose} school={school} />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

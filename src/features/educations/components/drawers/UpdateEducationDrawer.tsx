import { type JSX } from 'react';

import { type BrandEducation } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useEducationForm } from '~/features/educations/components/forms/hooks';
import { UpdateEducationForm } from '~/features/educations/components/forms/UpdateEducationForm';
import { useEducation } from '~/hooks/api';

interface UpdateEducationDrawerProps extends ExtendingDrawerProps {
  readonly eager: Pick<BrandEducation, 'major'>;
  readonly educationId: string;
}

export const UpdateEducationDrawer = ({
  eager,
  educationId,
  onClose,
}: UpdateEducationDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useEducation(educationId, {
    keepPreviousData: true,
    query: { includes: ['skills'], visibility: 'admin' },
  });
  const form = useEducationForm({ education: data });

  return (
    <DrawerForm eagerTitle={eager.major} form={form} titleField='major'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {education => (
          <UpdateEducationForm
            education={education}
            form={form}
            onCancel={() => onClose()}
            onSuccess={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

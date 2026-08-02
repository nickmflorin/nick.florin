import { type JSX } from 'react';

import { type BrandExperience } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useExperienceForm } from '~/features/experiences/components/forms/hooks';
import { UpdateExperienceForm } from '~/features/experiences/components/forms/UpdateExperienceForm';
import { useExperience } from '~/hooks/api';

interface UpdateExperienceDrawerProps extends ExtendingDrawerProps {
  readonly eager: Pick<BrandExperience, 'title'>;
  readonly experienceId: string;
}

export const UpdateExperienceDrawer = ({
  eager,
  experienceId,
  onClose,
}: UpdateExperienceDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useExperience(experienceId, {
    keepPreviousData: true,
    query: { includes: ['skills'], visibility: 'admin' },
  });
  const form = useExperienceForm({ experience: data });

  return (
    <DrawerForm eagerTitle={eager.title} form={form} titleField='title'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {experience => (
          <UpdateExperienceForm
            experience={experience}
            form={form}
            onCancel={() => onClose()}
            onSuccess={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

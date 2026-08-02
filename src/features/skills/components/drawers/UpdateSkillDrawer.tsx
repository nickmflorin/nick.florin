import { type JSX } from 'react';

import { type BrandSkill } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { useSkillForm } from '~/features/skills/components/forms/hooks';
import { UpdateSkillForm } from '~/features/skills/components/forms/UpdateSkillForm';
import { useSkill } from '~/hooks/api';

interface UpdateSkillDrawerProps extends ExtendingDrawerProps {
  readonly eager: Pick<BrandSkill, 'label'>;
  readonly skillId: string;
}

export const UpdateSkillDrawer = ({
  eager,
  onClose,
  skillId,
}: UpdateSkillDrawerProps): JSX.Element => {
  const { data, error, isLoading, isValidating } = useSkill(skillId, {
    keepPreviousData: true,
    query: {
      includes: ['projects', 'educations', 'experiences', 'repositories', 'courses'],
      visibility: 'admin',
    },
  });
  const form = useSkillForm();

  return (
    <DrawerForm eagerTitle={eager.label} form={form} titleField='label'>
      <ApiResponseState data={data} error={error} isLoading={isLoading || isValidating}>
        {skill => (
          <UpdateSkillForm form={form} onCancel={onClose} onSuccess={onClose} skill={skill} />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

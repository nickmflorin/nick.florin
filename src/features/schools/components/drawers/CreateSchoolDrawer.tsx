import { type JSX } from 'react';

import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { CreateSchoolForm } from '~/features/schools/components/forms/CreateSchoolForm';
import { useSchoolForm } from '~/features/schools/components/forms/hooks';

interface CreateSchoolDrawerProps extends ExtendingDrawerProps {}

export const CreateSchoolDrawer = ({ onClose }: CreateSchoolDrawerProps): JSX.Element => {
  const form = useSchoolForm();

  return (
    <DrawerForm form={form} titleField='name' titlePlaceholder='New School'>
      <CreateSchoolForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

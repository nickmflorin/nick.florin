import { type JSX } from 'react';

import { type ExtendingDrawerProps } from '~/components/drawers';
import { DrawerForm } from '~/components/drawers/DrawerForm';
import { CreateProjectForm } from '~/features/projects/components/forms/CreateProjectForm';
import { useProjectForm } from '~/features/projects/components/forms/hooks';

interface CreateProjectDrawerProps extends ExtendingDrawerProps {}

export const CreateProjectDrawer = ({ onClose }: CreateProjectDrawerProps): JSX.Element => {
  const form = useProjectForm();

  return (
    <DrawerForm form={form} titleField='name' titlePlaceholder='New Project'>
      <CreateProjectForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

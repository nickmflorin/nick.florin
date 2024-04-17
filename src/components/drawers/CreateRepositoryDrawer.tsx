import { CreateRepositoryForm } from "~/components/forms/repositories/CreateRepositoryForm";
import { useRepositoryForm } from "~/components/forms/repositories/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface CreateRepositoryDrawerProps extends ExtendingDrawerProps {}

export const CreateRepositoryDrawer = ({ onClose }: CreateRepositoryDrawerProps): JSX.Element => {
  const form = useRepositoryForm();

  return (
    <DrawerForm form={form} titleField="slug" titlePlaceholder="new-repository">
      <CreateRepositoryForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateRepositoryDrawer;

import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateRepositoryForm } from "~/features/repositories/components/forms/CreateRepositoryForm";
import { useRepositoryForm } from "~/features/repositories/components/forms/hooks";

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

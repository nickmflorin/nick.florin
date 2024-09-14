import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateRepositoryForm } from "~/components/forms/repositories/CreateRepositoryForm";
import { useRepositoryForm } from "~/components/forms/repositories/hooks";

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

import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateEducationForm } from "~/features/educations/components/forms/CreateEducationForm";
import { useEducationForm } from "~/features/educations/components/forms/hooks";

interface CreateEducationDrawerProps extends ExtendingDrawerProps {}

export const CreateEducationDrawer = ({ onClose }: CreateEducationDrawerProps): JSX.Element => {
  const form = useEducationForm({});
  return (
    <DrawerForm form={form} titleField="major" titlePlaceholder="New Education">
      <CreateEducationForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateEducationDrawer;

import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateEducationForm } from "~/components/forms/educations/CreateEducationForm";
import { useEducationForm } from "~/components/forms/educations/hooks";

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

import { CreateEducationForm } from "~/components/forms/educations/CreateEducationForm";
import { useEducationForm } from "~/components/forms/educations/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

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

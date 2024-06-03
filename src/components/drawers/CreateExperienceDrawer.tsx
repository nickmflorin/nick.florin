import { CreateExperienceForm } from "~/components/forms/experiences/CreateExperienceForm";
import { useExperienceForm } from "~/components/forms/experiences/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface CreateExperienceDrawerProps extends ExtendingDrawerProps {}

export const CreateExperienceDrawer = ({ onClose }: CreateExperienceDrawerProps): JSX.Element => {
  const form = useExperienceForm({});
  return (
    <DrawerForm form={form} titleField="title" titlePlaceholder="New Experience">
      <CreateExperienceForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateExperienceDrawer;

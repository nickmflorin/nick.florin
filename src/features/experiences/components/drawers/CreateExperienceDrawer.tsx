import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateExperienceForm } from "~/features/experiences/components/forms/CreateExperienceForm";
import { useExperienceForm } from "~/features/experiences/components/forms/hooks";

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

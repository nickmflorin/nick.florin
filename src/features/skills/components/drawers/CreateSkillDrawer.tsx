import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateSkillForm } from "~/features/skills/components/forms/CreateSkillForm";
import { useSkillForm } from "~/features/skills/components/forms/hooks";

interface CreateCourseDrawerProps extends ExtendingDrawerProps {}

export const CreateCourseDrawer = ({ onClose }: CreateCourseDrawerProps): JSX.Element => {
  const form = useSkillForm();

  return (
    <DrawerForm form={form} titleField="label" titlePlaceholder="New Skill">
      <CreateSkillForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateCourseDrawer;

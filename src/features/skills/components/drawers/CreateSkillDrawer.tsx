import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateSkillForm } from "~/components/forms/skills/CreateSkillForm";
import { useSkillForm } from "~/components/forms/skills/hooks";

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

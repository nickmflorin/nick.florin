import { CreateSkillForm } from "~/components/forms/skills/CreateSkillForm";
import { useSkillForm } from "~/components/forms/skills/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

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

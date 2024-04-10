import { CreateProjectForm } from "~/components/forms/projects/CreateProjectForm";
import { useProjectForm } from "~/components/forms/projects/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface CreateCourseDrawerProps extends ExtendingDrawerProps {}

export const CreateCourseDrawer = ({ onClose }: CreateCourseDrawerProps): JSX.Element => {
  const form = useProjectForm();

  return (
    <DrawerForm form={form} titleField="name" titlePlaceholder="New Project">
      <CreateProjectForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateCourseDrawer;

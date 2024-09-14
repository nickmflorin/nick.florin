import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateProjectForm } from "~/components/forms/projects/CreateProjectForm";
import { useProjectForm } from "~/components/forms/projects/hooks";

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

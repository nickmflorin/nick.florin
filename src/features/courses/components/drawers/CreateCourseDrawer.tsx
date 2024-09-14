import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateCourseForm } from "~/components/forms/courses/CreateCourseForm";
import { useCourseForm } from "~/components/forms/courses/hooks";

interface CreateCourseDrawerProps extends ExtendingDrawerProps {}

export const CreateCourseDrawer = ({ onClose }: CreateCourseDrawerProps): JSX.Element => {
  const form = useCourseForm();

  return (
    <DrawerForm form={form} titleField="name" titlePlaceholder="New Course">
      <CreateCourseForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateCourseDrawer;

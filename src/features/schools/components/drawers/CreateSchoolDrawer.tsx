import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateSchoolForm } from "~/features/schools/components/forms/CreateSchoolForm";
import { useSchoolForm } from "~/features/schools/components/forms/hooks";

interface CreateCourseDrawerProps extends ExtendingDrawerProps {}

export const CreateCourseDrawer = ({ onClose }: CreateCourseDrawerProps): JSX.Element => {
  const form = useSchoolForm();

  return (
    <DrawerForm form={form} titleField="name" titlePlaceholder="New School">
      <CreateSchoolForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateCourseDrawer;

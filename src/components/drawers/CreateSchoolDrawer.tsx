import { CreateSchoolForm } from "~/components/forms/schools/CreateSchoolForm";
import { useSchoolForm } from "~/components/forms/schools/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

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

import { CreateCourseForm } from "~/components/forms/courses/CreateCourseForm";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

interface CreateCourseDrawerProps extends ExtendingDrawerProps {}

export const CreateCourseDrawer = ({ onClose }: CreateCourseDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create a Course</DrawerHeader>
    <DrawerContent>
      <CreateCourseForm
        className="mt-[16px]"
        onCancel={() => onClose()}
        onSuccess={() => onClose()}
      />
    </DrawerContent>
  </Drawer>
);

export default CreateCourseDrawer;

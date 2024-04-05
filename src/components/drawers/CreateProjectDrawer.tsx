import { CreateProjectForm } from "~/components/forms/projects/CreateProjectForm";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

interface CreateProjectDrawerProps extends ExtendingDrawerProps {}

export const CreateProjectDrawer = ({ onClose }: CreateProjectDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create a Project</DrawerHeader>
    <DrawerContent>
      <CreateProjectForm
        className="mt-[16px]"
        onCancel={() => onClose()}
        onSuccess={() => onClose()}
      />
    </DrawerContent>
  </Drawer>
);

export default CreateProjectDrawer;

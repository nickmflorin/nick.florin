import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

const CreateExperienceForm = dynamic(
  () => import("~/components/forms/experiences/CreateExperienceForm"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

interface CreateExperienceDrawerProps extends ExtendingDrawerProps {}

export const CreateExperienceDrawer = ({ onClose }: CreateExperienceDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create an Experience</DrawerHeader>
    <DrawerContent>
      <CreateExperienceForm
        className="mt-[16px]"
        onCancel={() => onClose()}
        onSuccess={() => onClose()}
      />
    </DrawerContent>
  </Drawer>
);

export default CreateExperienceDrawer;

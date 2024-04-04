import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

const CreateEducationForm = dynamic(
  () => import("~/components/forms/educations/CreateEducationForm"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

interface CreateEducationDrawerProps extends ExtendingDrawerProps {}

export const CreateEducationDrawer = ({ onClose }: CreateEducationDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create an Education</DrawerHeader>
    <DrawerContent>
      <CreateEducationForm
        className="mt-[16px]"
        onCancel={() => onClose()}
        onSuccess={() => onClose()}
      />
    </DrawerContent>
  </Drawer>
);

export default CreateEducationDrawer;

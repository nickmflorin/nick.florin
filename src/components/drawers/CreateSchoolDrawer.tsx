import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

const CreateSchoolForm = dynamic(() => import("~/components/forms/schools/CreateSchoolForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface CreateSchoolDrawerProps extends ExtendingDrawerProps {}

export const CreateSchoolDrawer = ({ onClose }: CreateSchoolDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create a School</DrawerHeader>
    <DrawerContent>
      <CreateSchoolForm
        className="mt-[16px]"
        onCancel={() => onClose()}
        onSuccess={() => onClose()}
      />
    </DrawerContent>
  </Drawer>
);

export default CreateSchoolDrawer;

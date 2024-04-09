import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

const CreateCompanyForm = dynamic(() => import("~/components/forms/companies/CreateCompanyForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface CreateCompanyDrawerProps extends ExtendingDrawerProps {}

export const CreateCompanyDrawer = ({ onClose }: CreateCompanyDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create a Company</DrawerHeader>
    <DrawerContent className="overflow-y-hidden">
      <CreateCompanyForm onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerContent>
  </Drawer>
);

export default CreateCompanyDrawer;

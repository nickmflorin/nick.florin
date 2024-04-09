import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

const CreateSkillForm = dynamic(() => import("~/components/forms/skills/CreateSkillForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface CreateSkillDrawerProps extends ExtendingDrawerProps {}

export const CreateSkillDrawer = ({ onClose }: CreateSkillDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create a School</DrawerHeader>
    <DrawerContent>
      <CreateSkillForm onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerContent>
  </Drawer>
);

export default CreateSkillDrawer;

import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";
import { type ExtendingDrawerProps } from "./provider";

interface CreateProjectDrawerProps extends ExtendingDrawerProps {}

export const CreateProjectDrawer = ({ onClose }: CreateProjectDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Create a Project</DrawerHeader>
    <DrawerContent>In Progress</DrawerContent>
  </Drawer>
);

export default CreateProjectDrawer;

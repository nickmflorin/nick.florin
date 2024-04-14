import { Drawer } from "~/components/drawers/Drawer";
import { DrawerHeader } from "~/components/drawers/DrawerHeader";

import { type ExtendingDrawerProps } from "../provider";

import { ResumeDrawerContent } from "./ResumeDrawerContent";

interface ResumeDrawerProps extends ExtendingDrawerProps {}

export const ResumeDrawer = ({ onClose }: ResumeDrawerProps): JSX.Element => (
  <Drawer>
    <DrawerHeader>Resumes</DrawerHeader>
    <ResumeDrawerContent />
  </Drawer>
);

export default ResumeDrawer;

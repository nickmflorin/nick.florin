import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import { Drawer } from "./Drawer";

import { type ExtendingDrawerProps } from ".";

const CreateSkillForm = dynamic(() => import("~/components/forms/skills/CreateSkillForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface CreateSkillDrawerProps extends ExtendingDrawerProps {}

export const CreateSkillDrawer = ({ onClose }: CreateSkillDrawerProps): JSX.Element => (
  <Drawer>
    <CreateSkillForm className="mt-[16px]" onCancel={() => onClose()} onSuccess={() => onClose()} />
  </Drawer>
);

export default CreateSkillDrawer;

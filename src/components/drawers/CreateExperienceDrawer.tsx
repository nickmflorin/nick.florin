import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

import { Drawer } from "./Drawer";

import { type ExtendingDrawerProps } from ".";

const CreateExperienceForm = dynamic(
  () => import("~/components/forms/experiences/CreateExperienceForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

interface CreateExperienceDrawerProps extends ExtendingDrawerProps {}

export const CreateExperienceDrawer = ({ onClose }: CreateExperienceDrawerProps): JSX.Element => (
  <Drawer>
    <CreateExperienceForm
      className="mt-[16px]"
      onCancel={() => onClose()}
      onSuccess={() => onClose()}
    />
  </Drawer>
);

export default CreateExperienceDrawer;

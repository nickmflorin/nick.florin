import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

import { Drawer } from "./Drawer";

import { type ExtendingDrawerProps } from ".";

const CreateEducationForm = dynamic(
  () => import("~/components/forms/educations/CreateEducationForm"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

interface CreateEducationDrawerProps extends ExtendingDrawerProps {}

export const CreateEducationDrawer = ({ onClose }: CreateEducationDrawerProps): JSX.Element => (
  <Drawer>
    <CreateEducationForm
      className="mt-[16px]"
      onCancel={() => onClose()}
      onSuccess={() => onClose()}
    />
  </Drawer>
);

export default CreateEducationDrawer;

import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

import { Drawer } from "./Drawer";

import { type ExtendingDrawerProps } from ".";

const CreateSchoolForm = dynamic(() => import("~/components/forms/schools/CreateSchoolForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface CreateSchoolDrawerProps extends ExtendingDrawerProps {}

export const CreateSchoolDrawer = ({ onClose }: CreateSchoolDrawerProps): JSX.Element => (
  <Drawer>
    <CreateSchoolForm
      className="mt-[16px]"
      onCancel={() => onClose()}
      onSuccess={() => onClose()}
    />
  </Drawer>
);

export default CreateSchoolDrawer;

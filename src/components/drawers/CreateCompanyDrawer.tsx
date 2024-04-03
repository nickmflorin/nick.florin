import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

import { Drawer } from "./Drawer";

import { type ExtendingDrawerProps } from ".";

const CreateCompanyForm = dynamic(() => import("~/components/forms/companies/CreateCompanyForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface CreateCompanyDrawerProps extends ExtendingDrawerProps {}

export const CreateCompanyDrawer = ({ onClose }: CreateCompanyDrawerProps): JSX.Element => (
  <Drawer>
    <CreateCompanyForm
      className="mt-[16px]"
      onCancel={() => onClose()}
      onSuccess={() => onClose()}
    />
  </Drawer>
);

export default CreateCompanyDrawer;

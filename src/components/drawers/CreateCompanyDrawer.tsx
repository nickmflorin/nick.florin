import { CreateCompanyForm } from "~/components/forms/companies/CreateCompanyForm";
import { useCompanyForm } from "~/components/forms/companies/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface CreateCompanyDrawerProps extends ExtendingDrawerProps {}

export const CreateCompanyDrawer = ({ onClose }: CreateCompanyDrawerProps): JSX.Element => {
  const form = useCompanyForm();
  return (
    <DrawerForm form={form} titleField="name" titlePlaceholder="New Company">
      <CreateCompanyForm form={form} onCancel={() => onClose()} onSuccess={() => onClose()} />
    </DrawerForm>
  );
};

export default CreateCompanyDrawer;

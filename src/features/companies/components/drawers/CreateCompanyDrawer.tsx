import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateCompanyForm } from "~/components/forms/companies/CreateCompanyForm";
import { useCompanyForm } from "~/components/forms/companies/hooks";

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

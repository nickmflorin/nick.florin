import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { CreateCompanyForm } from "~/features/companies/components/forms/CreateCompanyForm";
import { useCompanyForm } from "~/features/companies/components/forms/hooks";

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

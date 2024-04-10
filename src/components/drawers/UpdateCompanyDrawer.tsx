import { isUuid } from "~/lib/typeguards";
import type { BrandCompany } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useCompanyForm } from "~/components/forms/companies/hooks";
import { UpdateCompanyForm } from "~/components/forms/companies/UpdateCompanyForm";
import { useCompany } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateCompanyDrawerProps
  extends ExtendingDrawerProps<{
    readonly companyId: string;
    readonly eager: Pick<BrandCompany, "name">;
  }> {}

export const UpdateCompanyDrawer = ({
  companyId,
  eager,
  onClose,
}: UpdateCompanyDrawerProps): JSX.Element => {
  const form = useCompanyForm();

  const { data, isLoading, error, isValidating } = useCompany(
    isUuid(companyId) ? companyId : null,
    {
      keepPreviousData: true,
    },
  );
  return (
    <DrawerForm form={form} titleField="name" titlePlaceholder={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {company => <UpdateCompanyForm form={form} company={company} onCancel={() => onClose()} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCompanyDrawer;

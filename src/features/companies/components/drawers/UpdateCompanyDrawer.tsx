import { isUuid } from "~/lib/typeguards";
import type { BrandCompany } from "~/prisma/model";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useCompanyForm } from "~/features/companies/components/forms/hooks";
import { UpdateCompanyForm } from "~/features/companies/components/forms/UpdateCompanyForm";
import { useCompany } from "~/hooks";

interface UpdateCompanyDrawerProps extends ExtendingDrawerProps {
  readonly companyId: string;
  readonly eager: Pick<BrandCompany, "name">;
}

export const UpdateCompanyDrawer = ({
  companyId,
  eager,
  onClose,
}: UpdateCompanyDrawerProps): JSX.Element => {
  const form = useCompanyForm();

  const { data, isLoading, error, isValidating } = useCompany(
    isUuid(companyId) ? companyId : null,
    { keepPreviousData: true, query: { visibility: "admin", includes: [] } },
  );
  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {company => <UpdateCompanyForm form={form} company={company} onCancel={() => onClose()} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCompanyDrawer;

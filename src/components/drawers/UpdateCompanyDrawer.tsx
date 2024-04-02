import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useCompany } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const CompanyForm = dynamic(() => import("~/components/forms/companies/UpdateCompanyForm"), {
  loading: () => <Loading loading={true} />,
});

interface UpdateCompanyDrawerProps
  extends ExtendingDrawerProps<{
    readonly companyId: string;
  }> {}

export const UpdateCompanyDrawer = ({ companyId }: UpdateCompanyDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useCompany(
    isUuid(companyId) ? companyId : null,
    {
      keepPreviousData: true,
    },
  );
  return (
    <Drawer className="overflow-y-auto">
      <ApiResponseView error={error} isLoading={isLoading || isValidating} data={data}>
        {company => (
          <>
            <DrawerHeader>{company.name}</DrawerHeader>
            <DrawerContent>
              <CompanyForm company={company} />
            </DrawerContent>
          </>
        )}
      </ApiResponseView>
    </Drawer>
  );
};

export default UpdateCompanyDrawer;

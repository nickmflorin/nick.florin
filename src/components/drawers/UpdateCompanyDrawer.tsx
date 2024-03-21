import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useCompany } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const CompanyForm = dynamic(() => import("~/components/forms/companies/UpdateCompanyForm"), {
  loading: () => <Loading loading={true} />,
});

interface UpdateCompanyDrawerProps {
  readonly companyId: string;
  readonly onClose: () => void;
}

export const UpdateCompanyDrawer = ({
  companyId,
  onClose,
}: UpdateCompanyDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useCompany(
    isUuid(companyId) ? companyId : null,
    {
      keepPreviousData: true,
    },
  );
  return (
    <ClientDrawer onClose={onClose} className="overflow-y-scroll">
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
    </ClientDrawer>
  );
};

export default UpdateCompanyDrawer;

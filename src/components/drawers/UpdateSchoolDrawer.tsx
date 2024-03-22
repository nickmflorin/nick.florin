import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useSchool } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const SchoolForm = dynamic(() => import("~/components/forms/schools/UpdateSchoolForm"), {
  loading: () => <Loading loading={true} />,
});

interface UpdateSchoolDrawerProps {
  readonly schoolId: string;
  readonly onClose: () => void;
}

export const UpdateSchoolDrawer = ({ schoolId, onClose }: UpdateSchoolDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useSchool(isUuid(schoolId) ? schoolId : null, {
    keepPreviousData: true,
  });
  return (
    <ClientDrawer onClose={onClose} className="overflow-y-scroll" id="update-school">
      <ApiResponseView error={error} isLoading={isLoading || isValidating} data={data}>
        {school => (
          <>
            <DrawerHeader>{school.name}</DrawerHeader>
            <DrawerContent>
              <SchoolForm school={school} />
            </DrawerContent>
          </>
        )}
      </ApiResponseView>
    </ClientDrawer>
  );
};

export default UpdateSchoolDrawer;

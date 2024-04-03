import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useSchool } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const SchoolForm = dynamic(() => import("~/components/forms/schools/UpdateSchoolForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface UpdateSchoolDrawerProps
  extends ExtendingDrawerProps<{
    readonly schoolId: string;
  }> {}

export const UpdateSchoolDrawer = ({ schoolId }: UpdateSchoolDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useSchool(isUuid(schoolId) ? schoolId : null, {
    keepPreviousData: true,
  });
  return (
    <Drawer className="overflow-y-auto">
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
    </Drawer>
  );
};

export default UpdateSchoolDrawer;

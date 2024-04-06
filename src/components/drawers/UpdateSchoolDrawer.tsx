import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
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
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {school => (
          <>
            <DrawerHeader>{school.name}</DrawerHeader>
            <DrawerContent>
              <SchoolForm school={school} />
            </DrawerContent>
          </>
        )}
      </ApiResponseState>
    </Drawer>
  );
};

export default UpdateSchoolDrawer;

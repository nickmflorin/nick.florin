import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useEducation } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const EducationForm = dynamic(() => import("~/components/forms/educations/UpdateEducationForm"), {
  loading: () => <Loading loading={true} />,
});

interface UpdateEducationDrawerProps
  extends ExtendingDrawerProps<{
    readonly educationId: string;
  }> {}

export const UpdateEducationDrawer = ({ educationId }: UpdateEducationDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useEducation(isUuid(educationId) ? educationId : null, {
    keepPreviousData: true,
  });
  return (
    <Drawer className="overflow-y-auto">
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {education => (
          <>
            <DrawerHeader>{education.major}</DrawerHeader>
            <DrawerContent>
              <EducationForm education={education} />
            </DrawerContent>
          </>
        )}
      </ApiResponseView>
    </Drawer>
  );
};

export default UpdateEducationDrawer;

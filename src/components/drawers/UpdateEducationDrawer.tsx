import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { useEducation } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const EducationForm = dynamic(() => import("~/components/forms/educations/UpdateEducationForm"), {
  loading: () => <Loading isLoading={true} />,
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
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {education => (
          <>
            <DrawerHeader>{education.major}</DrawerHeader>
            <DrawerContent>
              <EducationForm education={education} />
            </DrawerContent>
          </>
        )}
      </ApiResponseState>
    </Drawer>
  );
};

export default UpdateEducationDrawer;

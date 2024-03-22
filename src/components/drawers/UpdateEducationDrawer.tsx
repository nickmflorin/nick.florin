import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useEducation } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const EducationForm = dynamic(() => import("~/components/forms/educations/UpdateEducationForm"), {
  loading: () => <Loading loading={true} />,
});

interface UpdateEducationDrawerProps {
  readonly educationId: string;
  readonly onClose: () => void;
}

export const UpdateEducationDrawer = ({
  educationId,
  onClose,
}: UpdateEducationDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useEducation(isUuid(educationId) ? educationId : null, {
    keepPreviousData: true,
  });
  return (
    <ClientDrawer onClose={onClose} className="overflow-y-scroll" id="update-education">
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
    </ClientDrawer>
  );
};

export default UpdateEducationDrawer;

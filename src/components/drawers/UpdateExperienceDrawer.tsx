import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useExperience } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const ExperienceForm = dynamic(
  () => import("~/components/forms/experiences/UpdateExperienceForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

interface UpdateEducationDrawerProps {
  readonly experienceId: string;
  readonly onClose: () => void;
}

export const UpdateEducationDrawer = ({
  experienceId,
  onClose,
}: UpdateEducationDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useExperience(isUuid(experienceId) ? experienceId : null, {
    keepPreviousData: true,
  });
  return (
    <ClientDrawer onClose={onClose} className="overflow-y-scroll">
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {experience => (
          <>
            <DrawerHeader>{experience.title}</DrawerHeader>
            <DrawerContent>
              <ExperienceForm experience={experience} />
            </DrawerContent>
          </>
        )}
      </ApiResponseView>
    </ClientDrawer>
  );
};

export default UpdateEducationDrawer;

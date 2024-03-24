import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useExperience } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const ExperienceForm = dynamic(
  () => import("~/components/forms/experiences/UpdateExperienceForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

interface UpdateExperienceDrawerProps
  extends ExtendingDrawerProps<{
    readonly experienceId: string;
  }> {}

export const UpdateExperienceDrawer = ({
  experienceId,
}: UpdateExperienceDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useExperience(isUuid(experienceId) ? experienceId : null, {
    keepPreviousData: true,
  });
  return (
    <Drawer className="overflow-y-scroll">
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
    </Drawer>
  );
};

export default UpdateExperienceDrawer;

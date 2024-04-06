import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { useExperience } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const ExperienceForm = dynamic(
  () => import("~/components/forms/experiences/UpdateExperienceForm"),
  {
    loading: () => <Loading isLoading={true} />,
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
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {experience => (
          <>
            <DrawerHeader>{experience.title}</DrawerHeader>
            <DrawerContent>
              <ExperienceForm experience={experience} />
            </DrawerContent>
          </>
        )}
      </ApiResponseState>
    </Drawer>
  );
};

export default UpdateExperienceDrawer;

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { Drawer } from "~/components/drawers/Drawer";
import { useExperience } from "~/hooks";

import { ExperienceDrawerContent } from "./ExperienceDrawerContent";

export interface SkillDrawerProps extends ExtendingDrawerProps {
  readonly experienceId: string;
}

export const ExperienceDrawer = ({ experienceId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useExperience(experienceId, {
    query: {
      includes: ["skills", "details"],
      visibility: "public",
    },
    keepPreviousData: true,
  });
  return (
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {experience => <ExperienceDrawerContent experience={experience} />}
      </ApiResponseState>
    </Drawer>
  );
};

export default ExperienceDrawer;

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
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
    <ContextDrawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {experience => <ExperienceDrawerContent experience={experience} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

export default ExperienceDrawer;

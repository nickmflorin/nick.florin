import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { useSkill } from "~/hooks";

import { SkillDrawerContent } from "./SkillDrawerContent";

export interface SkillDrawerProps extends ExtendingDrawerProps {
  readonly skillId: string;
}

export const SkillDrawer = ({ skillId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(skillId, {
    query: {
      includes: ["experiences", "educations", "projects", "repositories", "courses"],
      visibility: "public",
    },
    keepPreviousData: true,
  });
  return (
    <ContextDrawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {skill => <SkillDrawerContent skill={skill} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

export default SkillDrawer;

import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useSkill } from "~/hooks";

import { Drawer } from "../../Drawer";
import { type ExtendingDrawerProps } from "../../provider";

import { SkillDrawerContent } from "./SkillDrawerContent";

export interface SkillDrawerProps
  extends ExtendingDrawerProps<{
    readonly skillId: string;
  }> {}

export const SkillDrawer = ({ skillId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(skillId, {
    query: {
      includes: ["experiences", "educations", "projects", "repositories", "courses"],
      visibility: "public",
    },
    keepPreviousData: true,
  });
  return (
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {skill => <SkillDrawerContent skill={skill} />}
      </ApiResponseState>
    </Drawer>
  );
};

export default SkillDrawer;

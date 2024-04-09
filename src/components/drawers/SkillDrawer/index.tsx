import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useSkill } from "~/hooks";

import { type ExtendingDrawerProps } from "..";
import { Drawer } from "../Drawer";

import { SkillDrawerContent } from "./DrawerContent";

export interface SkillDrawerProps
  extends ExtendingDrawerProps<{
    readonly skillId: string;
  }> {}

export const SkillDrawer = ({ skillId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(skillId, {
    includes: ["experiences", "educations", "projects", "repositories"],
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

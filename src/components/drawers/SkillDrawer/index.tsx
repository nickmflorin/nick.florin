import { ApiResponseView } from "~/components/views/ApiResponseView";
import { useSkill } from "~/hooks";

import { type ExtendingDrawerProps } from "..";
import { Drawer } from "../Drawer";

import { SkillDrawerContent } from "./DrawerContent";

export interface SkillDrawerProps
  extends ExtendingDrawerProps<{
    readonly skillId: string;
  }> {}

export const SkillDrawer = ({ skillId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(
    skillId,
    { experiences: true, educations: true, projects: true },
    { keepPreviousData: true },
  );

  return (
    <Drawer className="overflow-y-scroll">
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {skill => <SkillDrawerContent skill={skill} />}
      </ApiResponseView>
    </Drawer>
  );
};

export default SkillDrawer;

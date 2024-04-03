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
  const { data, isLoading, error } = useSkill(skillId, {
    includes: ["experiences", "educations", "projects"],
    keepPreviousData: true,
  });

  return (
    <Drawer>
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {skill => <SkillDrawerContent skill={skill} />}
      </ApiResponseView>
    </Drawer>
  );
};

export default SkillDrawer;

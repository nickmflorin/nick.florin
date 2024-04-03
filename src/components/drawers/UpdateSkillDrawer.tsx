import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useSkill } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const SkillForm = dynamic(() => import("~/components/forms/skills/UpdateSkillForm"), {
  loading: () => <Loading isLoading={true} />,
});

interface UpdateSkillDrawerProps
  extends ExtendingDrawerProps<{
    readonly skillId: string;
  }> {}

export const UpdateSkillDrawer = ({ skillId }: UpdateSkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(isUuid(skillId) ? skillId : null, {
    includes: ["projects", "educations", "experiences"],
    keepPreviousData: true,
  });
  return (
    <Drawer className="overflow-y-auto">
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {skill => (
          <>
            <DrawerHeader>{skill.label}</DrawerHeader>
            <DrawerContent>
              <SkillForm skill={skill} />
            </DrawerContent>
          </>
        )}
      </ApiResponseView>
    </Drawer>
  );
};

export default UpdateSkillDrawer;

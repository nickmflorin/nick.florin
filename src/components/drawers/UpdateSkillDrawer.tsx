import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { Loading } from "~/components/views/Loading";
import { useSkill } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const SkillForm = dynamic(() => import("~/components/forms/skills/UpdateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

interface UpdateSkillDrawerProps {
  readonly skillId: string;
  readonly onClose: () => void;
}

export const UpdateSkillDrawer = ({ skillId, onClose }: UpdateSkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(isUuid(skillId) ? skillId : null, {
    keepPreviousData: true,
  });
  return (
    <ClientDrawer onClose={onClose} className="overflow-y-scroll">
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
    </ClientDrawer>
  );
};

export default UpdateSkillDrawer;

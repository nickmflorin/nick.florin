import { ApiResponseView } from "~/components/views/ApiResponseView";
import { useSkill } from "~/hooks";

import { ClientDrawer } from "../ClientDrawer";

import { SkillDrawerContent } from "./DrawerContent";

export interface SkillDrawerProps {
  readonly skillId: string;
  readonly onClose: () => void;
}

export const SkillDrawer = ({ onClose, skillId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useSkill(skillId, {
    keepPreviousData: true,
  });

  return (
    <ClientDrawer onClose={onClose} className="overflow-y-scroll" id="view-skill">
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {skill => <SkillDrawerContent skill={skill} />}
      </ApiResponseView>
    </ClientDrawer>
  );
};

export default SkillDrawer;

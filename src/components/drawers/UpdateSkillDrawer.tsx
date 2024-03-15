import dynamic from "next/dynamic";

import { getSkill } from "~/actions/fetches/get-skill";
import { ErrorView } from "~/components/views/ErrorView";
import { Loading } from "~/components/views/Loading";

const SkillForm = dynamic(() => import("~/components/forms/skills/UpdateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

const QueryParamDrawer = dynamic(() => import("./ServerDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateSkillDrawer = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  return (
    <QueryParamDrawer param="updateSkillId">
      {!skill ? (
        <ErrorView title="404">The requested resource could not be found.</ErrorView>
      ) : (
        <SkillForm skill={skill} />
      )}
    </QueryParamDrawer>
  );
};

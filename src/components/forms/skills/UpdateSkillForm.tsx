import dynamicFn from "next/dynamic";

import { getSkill } from "~/actions/fetches/get-skill";
import { Loading } from "~/components/views/Loading";

const SkillForm = dynamicFn(() => import("./ClientUpdateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateSkillForm = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  return skill ? <SkillForm skill={skill} /> : <></>;
};

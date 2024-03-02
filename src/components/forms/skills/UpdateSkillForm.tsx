import dynamic from "next/dynamic";

import { getSkill } from "~/actions/fetches/get-skill";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

const SkillForm = dynamic(() => import("./ClientUpdateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateSkillForm = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  if (!skill) {
    return <ErrorView title="404">The requested resource could not be found.</ErrorView>;
  }
  return skill ? <SkillForm skill={skill} /> : <></>;
};

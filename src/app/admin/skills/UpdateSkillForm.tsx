import dynamic from "next/dynamic";

import { getEducations } from "~/fetches/get-educations";
import { getExperiences } from "~/fetches/get-experiences";
import { getSkill } from "~/fetches/get-skill";
import { Title } from "~/components/typography/Title";
import { Loading } from "~/components/views/Loading";

const UpdateSkillForm = dynamic(() => import("~/components/forms/UpdateSkillForm"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export const ServerUpdateSkillForm = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  if (skill) {
    const educations = await getEducations({});
    const experiences = await getExperiences({});
    return (
      <div className="flex flex-col gap-[16px]">
        <Title order={4}>{skill.label}</Title>
        <UpdateSkillForm skill={skill} educations={educations} experiences={experiences} />
      </div>
    );
  }
  // TODO: Handle this better.
  return <></>;
};

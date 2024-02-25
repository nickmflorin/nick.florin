import dynamicFn from "next/dynamic";

import { getSkill } from "~/fetches/get-skill";
import { Title } from "~/components/typography/Title";
import { Loading } from "~/components/views/Loading";

const SkillForm = dynamicFn(() => import("~/components/forms/skill/UpdateSkillForm"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export const UpdateSkillForm = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  return (
    <div className="flex flex-col gap-[16px] h-full">
      {skill && (
        <>
          <Title order={4}>{skill.label}</Title>
          <SkillForm skill={skill} />
        </>
      )}
    </div>
  );
};

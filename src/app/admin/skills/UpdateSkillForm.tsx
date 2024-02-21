import dynamicFn from "next/dynamic";

import { type ApiEducation, type ApiExperience } from "~/prisma/model";
import { updateSkill } from "~/actions/updateSkill";
import { getEducations } from "~/fetches/get-educations";
import { getExperiences } from "~/fetches/get-experiences";
import { getSkill } from "~/fetches/get-skill";
import { Title } from "~/components/typography/Title";
import { Loading } from "~/components/views/Loading";

const UpdateSkillForm = dynamicFn(() => import("~/components/forms/UpdateSkillForm"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export const ServerUpdateSkillForm = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  let educations: ApiEducation[] = [];
  let experiences: ApiExperience[] = [];
  // Avoid the additional requests if we cannot render the form to begin with.
  if (skill) {
    educations = await getEducations({});
    experiences = await getExperiences({});
  }
  return (
    <div className="flex flex-col gap-[16px] h-full">
      {skill && (
        <>
          <Title order={4}>{skill.label}</Title>
          <UpdateSkillForm
            skill={skill}
            educations={educations}
            experiences={experiences}
            action={async data => {
              "use server";
              console.log("DATA");
              await updateSkill(skill.id, data);
            }}
          />
        </>
      )}
    </div>
  );
};

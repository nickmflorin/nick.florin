import { type ApiSkill } from "~/prisma/model";
import { ProgrammingDomains } from "~/components/badges/collections/ProgrammingDomains";
import { ProgrammingLanguages } from "~/components/badges/collections/ProgrammingLanguages";
import { SkillCategories } from "~/components/badges/collections/SkillCategories";
import { SkillExperienceBadge } from "~/components/badges/SkillExperienceBadge";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";
import { Title } from "~/components/typography/Title";
import { ShowHide } from "~/components/util";

import { Educations } from "./Educations";
import { Experiences } from "./Experiences";

export interface SkillDrawerContentProps {
  readonly skill: ApiSkill;
}

export const SkillDrawerContent = ({
  skill: {
    experiences,
    educations,
    label,
    description,
    categories,
    programmingDomains,
    programmingLanguages,
    experience,
    autoExperience,
  },
}: SkillDrawerContentProps) => (
  <div className="flex flex-col gap-[14px]">
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-row items-center gap-[6px]">
        <Title order={2} className="text-gray-700 max-w-fit">
          {label}
        </Title>
        <SkillExperienceBadge skill={{ experience, autoExperience }} />
      </div>
      <Description description={description} />
    </div>
    <ShowHide show={categories.length !== 0}>
      <div className="flex flex-col gap-[8px]">
        <Label size="sm" fontWeight="medium">
          Categories
        </Label>
        <SkillCategories categories={categories} />
      </div>
    </ShowHide>
    <ShowHide show={programmingLanguages.length !== 0}>
      <div className="flex flex-col gap-[8px]">
        <Label size="sm" fontWeight="medium">
          Languages
        </Label>
        <ProgrammingLanguages languages={programmingLanguages} />
      </div>
    </ShowHide>
    <ShowHide show={programmingDomains.length !== 0}>
      <div className="flex flex-col gap-[8px]">
        <Label size="sm" fontWeight="medium">
          Development
        </Label>
        <ProgrammingDomains domains={programmingDomains} />
      </div>
    </ShowHide>
    <div className="flex flex-col gap-[14px]">
      {experiences.length !== 0 && (
        <>
          <hr className="w-full border-t border-gray-200" />
          <Experiences experiences={experiences} />
        </>
      )}
      {educations.length !== 0 && (
        <>
          <hr className="w-full border-t border-gray-200" />
          <Educations educations={educations} />
        </>
      )}
    </div>
  </div>
);

export default SkillDrawerContent;

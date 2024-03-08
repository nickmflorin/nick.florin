"use client";
import pick from "lodash.pick";

import { type ApiSkill } from "~/prisma/model";
import { ProgrammingDomains } from "~/components/badges/collections/ProgrammingDomains";
import { ProgrammingLanguages } from "~/components/badges/collections/ProgrammingLanguages";
import { SkillCategories } from "~/components/badges/collections/SkillCategories";
import { LocationBadge } from "~/components/badges/LoocationBadge";
import { TimePeriodBadge } from "~/components/badges/TimePeriodBadge";
import { Drawer } from "~/components/drawers/Drawer";
import { EducationImage } from "~/components/images/EducationImage";
import { ExperienceImage } from "~/components/images/ExperienceImage";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";
import { ResponseRenderer } from "~/components/views/ResponseRenderer";
import { useSkill } from "~/hooks/api";

import { SkillExperienceBadge } from "../badges/SkillExperienceBadge";
import { ShowHide } from "../util";

const Experiences = ({ experiences }: { experiences: ApiSkill["experiences"] }) => (
  <div className="flex flex-col gap-[10px]">
    <Label size="sm" fontWeight="medium">
      Experience
    </Label>
    <div className="flex flex-col gap-[12px]">
      {experiences.map((experience, index) => (
        <div className="flex flex-row gap-[8px] max-w-full w-full" key={index}>
          <ExperienceImage size={28} experience={experience} />
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <Text size="md" fontWeight="medium">
                {experience.title}
              </Text>
              <LinkOrText fontWeight="regular" fontSize="sm" url={experience.company.websiteUrl}>
                {experience.company.name}
              </LinkOrText>
            </div>
            <div className="flex flex-wrap gap-y-[4px] gap-x-[6px]">
              <TimePeriodBadge
                fontSize="xs"
                timePeriod={{
                  startDate: experience.startDate,
                  endDate: experience.endDate,
                }}
              />
              <LocationBadge
                fontSize="xs"
                location={{
                  ...pick(experience.company, ["city", "state"]),
                  isRemote: experience.isRemote,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Educations = ({ educations }: { educations: ApiSkill["educations"] }) => (
  <div className="flex flex-col gap-[10px]">
    <Label size="sm" fontWeight="medium">
      Education
    </Label>
    <div className="flex flex-col gap-[12px]">
      {educations.map((education, index) => (
        <div className="flex flex-row gap-[8px] max-w-full w-full" key={index}>
          <EducationImage size={26} education={education} />
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <Text size="md" fontWeight="medium">
                {education.major}
              </Text>
              <LinkOrText fontWeight="regular" fontSize="sm" url={education.school.websiteUrl}>
                {education.school.name}
              </LinkOrText>
            </div>
            <div className="flex flex-wrap gap-y-[4px] gap-x-[6px]">
              <TimePeriodBadge
                fontSize="xs"
                timePeriod={{
                  startDate: education.startDate,
                  endDate: education.endDate,
                  postPoned: education.postPoned,
                }}
              />
              <LocationBadge fontSize="xs" location={pick(education.school, ["city", "state"])} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export interface SkillDrawerProps {
  readonly skillId: string;
}

export const SkillDrawer = ({ skillId }: SkillDrawerProps) => {
  const { data, isLoading, error } = useSkill(skillId);

  return (
    <Drawer className="overflow-y-scroll">
      <ResponseRenderer error={error} data={data} isLoading={isLoading}>
        {({
          experiences,
          educations,
          label,
          description,
          categories,
          programmingDomains,
          programmingLanguages,
          experience,
          autoExperience,
        }) => (
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
        )}
      </ResponseRenderer>
    </Drawer>
  );
};

export default SkillDrawer;

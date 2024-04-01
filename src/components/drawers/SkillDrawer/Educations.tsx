import pick from "lodash.pick";

import { type ApiSkill } from "~/prisma/model";
import { LocationBadge } from "~/components/badges/LoocationBadge";
import { TimePeriodBadge } from "~/components/badges/TimePeriodBadge";
import { EducationImage } from "~/components/images/EducationImage";
import { Label } from "~/components/typography/Label";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { Text } from "~/components/typography/Text";

export const Educations = ({
  educations,
}: {
  educations: ApiSkill<{ educations: true }>["educations"];
}) => (
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

export default Educations;

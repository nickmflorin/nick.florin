import pick from "lodash.pick";

import { type ApiSkill } from "~/prisma/model";
import { LocationBadge } from "~/components/badges/LoocationBadge";
import { TimePeriodBadge } from "~/components/badges/TimePeriodBadge";
import { ExperienceImage } from "~/components/images/ExperienceImage";
import { Label } from "~/components/typography/Label";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { Text } from "~/components/typography/Text";

export const Experiences = ({ experiences }: { experiences: ApiSkill["experiences"] }) => (
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

export default Experiences;

import pick from "lodash.pick";

import { type ApiExperience } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { ResumeTile } from "./ResumeTile";

export interface ExperienceTileProps extends ComponentProps {
  readonly experience: ApiExperience<{ details: true; skills: true }>;
}

export const ExperienceTile = ({ experience, ...props }: ExperienceTileProps): JSX.Element => (
  <ResumeTile
    {...pick(experience, ["skills", "details", "title"])}
    name={experience.company.name}
    websiteUrl={experience.company.websiteUrl}
    description={[experience.description]}
    timePeriod={pick(experience, ["startDate", "endDate"])}
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={experience.company.logoImageUrl}
    location={{
      city: experience.company.city,
      state: experience.company.state,
      isRemote: experience.isRemote,
    }}
    {...props}
  />
);

export default ExperienceTile;

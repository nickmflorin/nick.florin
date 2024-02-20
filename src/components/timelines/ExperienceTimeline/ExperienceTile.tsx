import dynamic from "next/dynamic";

import { type ApiExperience } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

const TimelineTile = dynamic(() => import("../TimelineTile"));

export interface ExperienceTileProps extends ComponentProps {
  readonly experience: ApiExperience<{ details: true; skills: true }>;
}

export const ExperienceTile = ({ experience, ...props }: ExperienceTileProps): JSX.Element => (
  <TimelineTile
    {...experience}
    subTitle={experience.company.name}
    subTitleHref={experience.company.websiteUrl}
    description={[experience.description]}
    endDate={experience.endDate ?? "current"}
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={experience.company.logoImageUrl}
    location={
      experience.isRemote ? "Remote" : `${experience.company.city}, ${experience.company.state}`
    }
    {...props}
  />
);

export default ExperienceTile;

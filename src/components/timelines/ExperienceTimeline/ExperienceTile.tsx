import dynamic from "next/dynamic";

import { type ApiExperience } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

const TimelineTile = dynamic(() => import("../TimelineTile"));

export interface ExperienceTileProps extends ComponentProps {
  readonly experience: ApiExperience;
}

export const ExperienceTile = ({ experience, ...props }: ExperienceTileProps): JSX.Element => (
  <TimelineTile
    title={experience.title}
    subTitle={experience.company.name}
    subTitleHref={experience.company.websiteUrl}
    description={[experience.description]}
    startDate={experience.startDate}
    endDate={experience.endDate ?? "current"}
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={experience.company.logoImageUrl}
    details={experience.details}
    skills={experience.skills}
    location={
      experience.isRemote ? "Remote" : `${experience.company.city}, ${experience.company.state}`
    }
    {...props}
  />
);

export default ExperienceTile;

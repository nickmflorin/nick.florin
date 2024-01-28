import { type ComponentProps } from "~/components/types";
import { type ApiExperience, type Company, type Experience } from "~/prisma/model";

import { ResumeTile } from "./ResumeTile";

export interface ExperienceTileProps extends ComponentProps {
  readonly experience: ApiExperience;
}

export const ExperienceTile = ({ experience, ...props }: ExperienceTileProps): JSX.Element => (
  <ResumeTile
    title={experience.title}
    subTitle={experience.company.name}
    description={experience.description}
    startDate={experience.startDate}
    endDate={experience.endDate ?? "current"}
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={experience.company.logoImageUrl}
    details={experience.details}
    skills={experience.skills}
    {...props}
  />
);

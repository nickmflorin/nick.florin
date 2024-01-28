import { type ComponentProps } from "~/components/types";
import { getDegreeData } from "~/prisma/enums";
import { type School, type Education } from "~/prisma/model";

import { ResumeTile } from "./ResumeTile";

export interface EducationTileProps extends ComponentProps {
  readonly education: Education & { readonly school: School };
}

export const EducationTile = ({ education, ...props }: EducationTileProps): JSX.Element => (
  <ResumeTile
    title={`${getDegreeData(education.degree).abbreviatedLabel} in ${education.major}`}
    subTitle={education.school.name}
    description={education.description}
    startDate={education.startDate}
    endDate={
      !education.endDate ? (education.postPoned ? "postponed" : "current") : education.endDate
    }
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={education.school.logoImageUrl}
    skills={[]}
    details={[]}
    {...props}
  />
);

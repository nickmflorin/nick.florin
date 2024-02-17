import dynamic from "next/dynamic";

import { type ComponentProps } from "~/components/types";
import { getDegreeData } from "~/prisma/enums";
import { type School, type Education } from "~/prisma/model";

const TimelineTile = dynamic(() => import("../TimelineTile"));

export interface EducationTileProps extends ComponentProps {
  readonly education: Education & { readonly school: School };
}

export const EducationTile = ({ education, ...props }: EducationTileProps): JSX.Element => (
  <TimelineTile
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
    location={`${education.school.city}, ${education.school.state}`}
    {...props}
  />
);

export default EducationTile;

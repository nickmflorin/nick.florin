import dynamic from "next/dynamic";

import pick from "lodash.pick";

import { type ApiEducation, getDegreeData } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

const TimelineTile = dynamic(() => import("../TimelineTile"));

export interface EducationTileProps extends ComponentProps {
  readonly education: ApiEducation<{ details: true; skills: true }>;
}

export const EducationTile = ({ education, ...props }: EducationTileProps): JSX.Element => (
  <TimelineTile
    {...pick(education, ["skills", "details", "startDate"])}
    title={`${getDegreeData(education.degree).abbreviatedLabel} in ${education.major}`}
    subTitle={education.school.name}
    description={[education.description, education.note]}
    endDate={
      !education.endDate ? (education.postPoned ? "postponed" : "current") : education.endDate
    }
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={education.school.logoImageUrl}
    location={`${education.school.city}, ${education.school.state}`}
    {...props}
  />
);

export default EducationTile;

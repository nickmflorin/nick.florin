import pick from "lodash.pick";

import { type ApiEducation, getDegreeData } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { TimelineTile } from "../TimelineTile";

export interface EducationTileProps extends ComponentProps {
  readonly education: ApiEducation<{ details: true; skills: true }>;
}

export const EducationTile = ({ education, ...props }: EducationTileProps): JSX.Element => (
  <TimelineTile
    {...pick(education, ["skills", "details"])}
    title={`${getDegreeData(education.degree).abbreviatedLabel} in ${education.major}`}
    name={education.school.name}
    websiteUrl={education.school.websiteUrl}
    description={[education.description, education.note]}
    timePeriod={pick(education, ["startDate", "endDate", "postPoned"])}
    fallbackImageIcon={{ name: "briefcase" }}
    imageUrl={education.school.logoImageUrl}
    location={pick(education.school, ["city", "state"])}
    {...props}
  />
);

export default EducationTile;

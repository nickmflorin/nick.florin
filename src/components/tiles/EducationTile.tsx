import pick from "lodash.pick";

import { type ApiEducation, getDegree } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { ResumeTile } from "./ResumeTile";

export interface EducationTileProps extends ComponentProps {
  readonly education: ApiEducation<["details", "skills"]>;
}

export const EducationTile = ({ education, ...props }: EducationTileProps): JSX.Element => (
  <ResumeTile
    {...pick(education, ["skills", "details"])}
    title={`${getDegree(education.degree).shortLabel} in ${education.major}`}
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

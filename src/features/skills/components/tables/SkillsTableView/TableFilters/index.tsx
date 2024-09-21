import { getEducations } from "~/actions/fetches/educations";
import { getExperiences } from "~/actions/fetches/experiences";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { type Filters } from "../types";

import { EducationFilter } from "./EducationFilter";
import { ExperienceFilter } from "./ExperienceFilter";

export interface SkillsAdminTableControlBarProps extends ComponentProps {
  readonly filters: Filters;
}

export const TableFilters = async ({ filters, ...props }: SkillsAdminTableControlBarProps) => {
  const educations = await getEducations({ filters, visibility: "admin", includes: [] });
  const experiences = await getExperiences({ filters, visibility: "admin", includes: [] });
  return (
    <div {...props} className={classNames("flex flex-row gap-[8px] items-center", props.className)}>
      <EducationFilter educations={educations} filters={filters} />
      <ExperienceFilter experiences={experiences} filters={filters} />
    </div>
  );
};

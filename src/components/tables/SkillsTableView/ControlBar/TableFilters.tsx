import clsx from "clsx";

import { getEducations } from "~/actions/fetches/get-educations";
import { getExperiences } from "~/actions/fetches/get-experiences";
import { type ComponentProps } from "~/components/types";

import { type Filters } from "../types";

import { EducationFilter } from "./EducationFilter";
import { ExperienceFilter } from "./ExperienceFilter";

export interface SkillsAdminTableControlBarProps extends ComponentProps {
  readonly filters: Filters;
}

export const TableFilters = async ({ filters, ...props }: SkillsAdminTableControlBarProps) => {
  const educations = await getEducations({ skills: true });
  const experiences = await getExperiences({ skills: true });
  return (
    <div {...props} className={clsx("flex flex-row gap-[8px] items-center", props.className)}>
      <EducationFilter educations={educations} filters={filters} />
      <ExperienceFilter experiences={experiences} filters={filters} />
    </div>
  );
};

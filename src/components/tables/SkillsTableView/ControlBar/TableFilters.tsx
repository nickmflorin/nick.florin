import clsx from "clsx";

import { getAdminEducations } from "~/actions/fetches/get-educations";
import { getAdminExperiences } from "~/actions/fetches/get-experiences";
import { type ComponentProps } from "~/components/types";

import { type Filters } from "../types";

import { EducationFilter } from "./EducationFilter";
import { ExperienceFilter } from "./ExperienceFilter";

export interface SkillsAdminTableControlBarProps extends ComponentProps {
  readonly filters: Filters;
  readonly page: number;
}

export const TableFilters = async ({
  filters,
  page,
  ...props
}: SkillsAdminTableControlBarProps) => {
  const educations = await getAdminEducations({ filters, page });
  const experiences = await getAdminExperiences({ filters, page });
  return (
    <div {...props} className={clsx("flex flex-row gap-[8px] items-center", props.className)}>
      <EducationFilter educations={educations} filters={filters} />
      <ExperienceFilter experiences={experiences} filters={filters} />
    </div>
  );
};

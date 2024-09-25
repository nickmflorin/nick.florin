import { type CoursesFilters } from "~/actions-v2";
import { fetchEducations } from "~/actions-v2/educations/fetch-educations";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { CoursesTableFilterBar as ClientCoursesTableFilterBar } from "~/features/courses/components/tables-v2/CoursesTableFilterBar";

export interface CoursesTableFilterBarProps {
  readonly filters: CoursesFilters;
}

export const CoursesTableFilterBar = async ({
  filters,
}: CoursesTableFilterBarProps): Promise<JSX.Element> => {
  const skillFetcher = fetchSkills([]);
  const { data: skills } = await skillFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  const educationFetcher = fetchEducations([]);
  const { data: educations } = await educationFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return <ClientCoursesTableFilterBar filters={filters} educations={educations} skills={skills} />;
};

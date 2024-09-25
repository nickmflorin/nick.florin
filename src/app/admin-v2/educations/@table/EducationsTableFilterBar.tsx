import { getCourses } from "~/actions/fetches/courses";
import { getSchools } from "~/actions/fetches/schools";
import { type EducationsFilters } from "~/actions-v2";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { EducationsTableFilterBar as ClientEducationsTableFilterBar } from "~/features/educations/components/tables-v2/EducationsTableFilterBar";

export interface EducationsTableFilterBarProps {
  readonly filters: EducationsFilters;
}

export const EducationsTableFilterBar = async ({
  filters,
}: EducationsTableFilterBarProps): Promise<JSX.Element> => {
  const fetcher = fetchSkills([]);
  const { data: skills } = await fetcher({ visibility: "admin", filters: {} }, { strict: true });
  const schools = await getSchools({ visibility: "admin", includes: [] });
  const courses = await getCourses({ visibility: "admin", includes: [] });

  return (
    <ClientEducationsTableFilterBar
      filters={filters}
      schools={schools}
      skills={skills}
      courses={courses}
    />
  );
};

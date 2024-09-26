import dynamic from "next/dynamic";

import { getSchools } from "~/actions/fetches/schools";
import { type EducationsFilters } from "~/actions-v2";
import { fetchCourses } from "~/actions-v2/courses/fetch-courses";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { EducationsTableFilterBar as ClientEducationsTableFilterBar } from "~/features/educations/components/tables-v2/EducationsTableFilterBar";

const CompaniesSchoolsDropdownMenu = dynamic(() =>
  import("~/features/resume/components/CompaniesSchoolsDropdownMenu").then(
    mod => mod.CompaniesSchoolsDropdownMenu,
  ),
);

export interface EducationsTableFilterBarProps {
  readonly filters: EducationsFilters;
}

export const EducationsTableFilterBar = async ({
  filters,
}: EducationsTableFilterBarProps): Promise<JSX.Element> => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  const schools = await getSchools({ visibility: "admin", includes: [] });

  const coursesFetcher = await fetchCourses([]);
  const { data: courses } = await coursesFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return (
    <ClientEducationsTableFilterBar
      filters={filters}
      schools={schools}
      skills={skills}
      courses={courses}
    >
      <CompaniesSchoolsDropdownMenu modelType="school" />
    </ClientEducationsTableFilterBar>
  );
};

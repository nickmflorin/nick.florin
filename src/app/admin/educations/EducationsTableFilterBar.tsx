import { Suspense } from "react";

import { getSchools as fetchSchools } from "~/actions/fetches/schools";
import { fetchCourses } from "~/actions-v2/courses/fetch-courses";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { EducationsTableFilterBar as ClientEducationsTableFilterBar } from "~/features/educations/components/tables/EducationsTableFilterBar";

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return skills;
};

const getCourses = async () => {
  const coursesFetcher = await fetchCourses([]);
  const { data: courses } = await coursesFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return courses;
};

const getSchools = async () => await fetchSchools({ includes: [], visibility: "admin" });

export const EducationsTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, courses, schools] = await Promise.all([getSkills(), getCourses(), getSchools()]);

  return (
    <Suspense>
      <ClientEducationsTableFilterBar courses={courses} skills={skills} schools={schools} />
    </Suspense>
  );
};

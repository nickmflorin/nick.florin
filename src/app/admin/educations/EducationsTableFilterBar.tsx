import { Suspense } from "react";

import { fetchCourses } from "~/actions/courses/fetch-courses";
import { fetchSchools } from "~/actions/schools/fetch-schools";
import { fetchSkills } from "~/actions/skills/fetch-skills";

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

const getSchools = async () => {
  const schoolsFetcher = await fetchSchools([]);
  const { data: schools } = await schoolsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return schools;
};

export const EducationsTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, courses, schools] = await Promise.all([getSkills(), getCourses(), getSchools()]);

  return (
    <Suspense>
      <ClientEducationsTableFilterBar courses={courses} skills={skills} schools={schools} />
    </Suspense>
  );
};

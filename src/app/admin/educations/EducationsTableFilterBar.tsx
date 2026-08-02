import { type JSX, Suspense } from 'react';

import { fetchCourses } from '~/actions/courses/fetch-courses';
import { fetchSchools } from '~/actions/schools/fetch-schools';
import { fetchSkills } from '~/actions/skills/fetch-skills';

import { EducationsTableFilterBar as ClientEducationsTableFilterBar } from '~/features/educations/components/tables/EducationsTableFilterBar';

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );

  return skills;
};

const getCourses = async () => {
  const coursesFetcher = fetchCourses([]);
  const { data: courses } = await coursesFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return courses;
};

const getSchools = async () => {
  const schoolsFetcher = fetchSchools([]);
  const { data: schools } = await schoolsFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return schools;
};

export const EducationsTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, courses, schools] = await Promise.all([getSkills(), getCourses(), getSchools()]);

  return (
    <Suspense>
      <ClientEducationsTableFilterBar courses={courses} schools={schools} skills={skills} />
    </Suspense>
  );
};

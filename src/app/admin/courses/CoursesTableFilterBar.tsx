import { type JSX, Suspense } from 'react';

import { fetchEducations } from '~/actions/educations/fetch-educations';
import { fetchSkills } from '~/actions/skills/fetch-skills';

import { CoursesTableFilterBar as ClientCoursesTableFilterBar } from '~/features/courses/components/tables/CoursesTableFilterBar';

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );

  return skills;
};

const getEducations = async () => {
  const educationFetcher = fetchEducations([]);
  const { data: educations } = await educationFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return educations;
};

export const CoursesTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, educations] = await Promise.all([getSkills(), getEducations()]);

  return (
    <Suspense>
      <ClientCoursesTableFilterBar educations={educations} skills={skills} />
    </Suspense>
  );
};

'use client';
import { ErrorView } from '~/components/errors/ErrorView';
import { CoursesTableControlBarPlaceholder } from '~/features/courses/components/tables/CoursesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <CoursesTableControlBarPlaceholder />
    <ErrorView>There was an error loading the courses. Do not worry, we are on it.</ErrorView>;
  </>
);

export default LoadingPage;

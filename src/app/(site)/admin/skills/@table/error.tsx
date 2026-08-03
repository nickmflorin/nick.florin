'use client';
import { ErrorView } from '~/components/errors/ErrorView';
import { SkillsTableControlBarPlaceholder } from '~/features/skills/components/tables/SkillsTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <SkillsTableControlBarPlaceholder />
    <ErrorView>There was an error loading the skills. Do not worry, we are on it.</ErrorView>;
  </>
);

export default LoadingPage;

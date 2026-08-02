import { type JSX } from 'react';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { ContextDrawer } from '~/components/drawers/ContextDrawer';
import { useExperience } from '~/hooks/api';

import { ExperienceDrawerContent } from './ExperienceDrawerContent';

export interface SkillDrawerProps extends ExtendingDrawerProps {
  readonly experienceId: string;
}

export const ExperienceDrawer = ({ experienceId }: SkillDrawerProps): JSX.Element => {
  const { data, error, isLoading } = useExperience(experienceId, {
    keepPreviousData: true,
    query: {
      includes: ['skills', 'details'],
      visibility: 'public',
    },
  });
  return (
    <ContextDrawer>
      <ApiResponseState data={data} error={error} isLoading={isLoading}>
        {experience => <ExperienceDrawerContent experience={experience} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

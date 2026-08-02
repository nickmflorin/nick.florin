import { type JSX } from 'react';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { ContextDrawer } from '~/components/drawers/ContextDrawer';
import { useEducation } from '~/hooks/api';

import { EducationDrawerContent } from './EducationDrawerContent';

export interface SkillDrawerProps extends ExtendingDrawerProps {
  readonly educationId: string;
}

export const EducationDrawer = ({ educationId }: SkillDrawerProps): JSX.Element => {
  const { data, error, isLoading } = useEducation(educationId, {
    keepPreviousData: true,
    query: {
      includes: ['skills', 'details', 'courses'],
      visibility: 'public',
    },
  });
  return (
    <ContextDrawer>
      <ApiResponseState data={data} error={error} isLoading={isLoading}>
        {education => <EducationDrawerContent education={education} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

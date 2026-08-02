import { type JSX } from 'react';

import { ApiResponseState } from '~/components/ApiResponseState';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { ContextDrawer } from '~/components/drawers/ContextDrawer';
import { useSkill } from '~/hooks/api';

import { SkillDrawerContent } from './SkillDrawerContent';

export interface SkillDrawerProps extends ExtendingDrawerProps {
  readonly skillId: string;
}

export const SkillDrawer = ({ skillId }: SkillDrawerProps): JSX.Element => {
  const { data, error, isLoading } = useSkill(skillId, {
    keepPreviousData: true,
    query: {
      includes: ['experiences', 'educations', 'projects', 'repositories', 'courses'],
      visibility: 'public',
    },
  });
  return (
    <ContextDrawer>
      <ApiResponseState data={data} error={error} isLoading={isLoading}>
        {skill => <SkillDrawerContent skill={skill} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

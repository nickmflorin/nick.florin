import { type JSX } from 'react';

import { Project, type ProjectProps } from '~/features/projects/components/Project';

import { BackgroundSection } from './BackgroundSection';
import { ConceptsSection } from './ConceptsSection';
import { Disclaimer } from './Disclaimer';
import { FeaturesSection } from './FeaturesSection';
import { ProjectDescription } from './ProjectDescription';

export interface GreenBudgetProps extends Omit<
  ProjectProps,
  'children' | 'description' | 'title'
> {}

export const GreenBudget = (props: GreenBudgetProps): JSX.Element => (
  <Project
    description={<ProjectDescription />}
    disclaimer={<Disclaimer />}
    title={props.project.name}
    {...props}
  >
    <BackgroundSection />
    <ConceptsSection />
    <FeaturesSection />
  </Project>
);

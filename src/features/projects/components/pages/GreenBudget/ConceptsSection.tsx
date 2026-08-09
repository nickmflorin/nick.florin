import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

import { RecursiveTreeStructureSection } from './RecursiveTreeStructureSection';

export const ConceptsSection = () => (
  <Section hasMarginBottom={false} title='Concepts'>
    <Description>
      In production budgeting, the <Emphasize>Top Sheet</Emphasize> holds the top-level line items
      in the budget, called <Emphasize>Accounts</Emphasize>. The estimated, actual and variance
      values for each <Emphasize>Account</Emphasize> are determined by accumulating the
      corresponding values on each <Emphasize>Sub Account</Emphasize> it contains.
    </Description>
    <ProjectImage
      alt='GreenBudget Top Sheet'
      caption={
        <CaptionDescription isCentered>
          An example of a <Emphasize.Caption>Top Sheet</Emphasize.Caption> in{' '}
          <Emphasize.Caption>GreenBudget</Emphasize.Caption>.
        </CaptionDescription>
      }
      src='/projects/greenbudget/topsheet.png'
    />
    <Description>
      When an <Emphasize>Account</Emphasize> is expanded, its row opens into a new table showing the{' '}
      <Emphasize>Sub Accounts</Emphasize> it contains. The metrics for each{' '}
      <Emphasize>Sub Account</Emphasize> funnel upwards into the associated{' '}
      <Emphasize>Account</Emphasize> row of the <Emphasize>Top Sheet</Emphasize>.
    </Description>
    <ProjectImage
      alt='GreenBudget Nested Accounts'
      caption={
        <CaptionDescription isCentered>
          The expanded <Emphasize.Caption>Sub Account</Emphasize.Caption> view for{' '}
          <Emphasize.Caption>Account 1001; Construction Contracts for Set</Emphasize.Caption>.
        </CaptionDescription>
      }
      src='/projects/greenbudget/subaccounts.png'
    />
    <RecursiveTreeStructureSection />
  </Section>
);

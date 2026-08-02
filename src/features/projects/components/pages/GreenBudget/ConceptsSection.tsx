import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

import { RecursiveTreeStructureSection } from './RecursiveTreeStructureSection';

export const ConceptsSection = () => (
  <Section hasMarginBottom={false} title='Concepts'>
    <Description>
      In production budgeting, the <Emphasize>Top Sheet</Emphasize> represents the top level line
      items, or <Emphasize>Account</Emphasize>(s) in the budget. The estimated, actual and variance
      values for each <Emphasize>Account</Emphasize> are determined based on the accumulation of
      related values on each <Emphasize>Sub Account</Emphasize> it contains.
    </Description>
    <ProjectImage
      alt='GreenBudget Top Sheet'
      caption={
        <CaptionDescription isCentered>
          An example of a <Emphasize.Caption>Top Sheet</Emphasize.Caption> in&nbsp;
          <Emphasize.Caption>GreenBudget</Emphasize.Caption>.
        </CaptionDescription>
      }
      src='/projects/greenbudget/topsheet.png'
    />
    <Description>
      When an <Emphasize>Account</Emphasize> is &quot;expanded&quot;, the&nbsp;
      <Emphasize>Account</Emphasize>&nbsp;row expands into a new table showing all of the&nbsp;
      <Emphasize>Sub Account</Emphasize>(s) that it contains. The metrics for each row (i.e.&nbsp;
      <Emphasize>Sub Account</Emphasize>(s)) funnel upwards to the associated&nbsp;
      <Emphasize>Account</Emphasize> row in the&nbsp;
      <Emphasize>Top Sheet</Emphasize>.
    </Description>
    <ProjectImage
      alt='GreenBudget Nested Accounts'
      caption={
        <CaptionDescription isCentered>
          An example of the expanded <Emphasize.Caption>Sub Account</Emphasize.Caption>(s) view
          for&nbsp;
          <Emphasize.Caption>Account 1001; Construction Contracts for Set</Emphasize.Caption>.
        </CaptionDescription>
      }
      src='/projects/greenbudget/subaccounts.png'
    />
    <RecursiveTreeStructureSection />
  </Section>
);

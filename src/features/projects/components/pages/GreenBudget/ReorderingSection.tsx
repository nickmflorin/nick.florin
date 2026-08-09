import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const ReorderingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Reordering'>
    <DescriptionGroup>
      <Description>
        In <Emphasize>GreenBudget</Emphasize>, a user could reorder the rows of any table view
        inside the budget, and the new ordering persisted automatically.
      </Description>
      <Description>
        This was a complicated feature to implement well. When a row is reordered, only that row
        should be updated in the database, not every row after it. To make that possible, we
        developed a{' '}
        <InlineLink
          element='a'
          href='https://github.com/nickmflorin/happybudget-api/blob/develop/src/happybudget/app/tabling/utils.py'
          openInNewTab
        >
          lexicographical sorting algorithm
        </InlineLink>{' '}
        that performs a reorder with a single database write, rather than updates to potentially
        every row in the table.
      </Description>
      <Description>
        The feature was also difficult because the ordering of rows in a production budget{' '}
        <i>means something</i>: it determines how <Emphasize>Markups</Emphasize> are applied and how{' '}
        <Emphasize>Groups</Emphasize> are constructed, among other things.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          A user moving a row within a table view of a{' '}
          <Emphasize.Caption>GreenBudget</Emphasize.Caption> budget. The move changes the{' '}
          <Emphasize.Caption>Group</Emphasize.Caption> structure of the view, which is why the
          calculated values of the two <Emphasize.Caption>Groups</Emphasize.Caption> change after
          the row settles.
        </CaptionDescription>
      }
      label='GreenBudget Reordering'
      src='/projects/greenbudget/reordering'
    />
  </Section>
);

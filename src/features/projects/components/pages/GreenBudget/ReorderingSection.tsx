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
        In <Emphasize>GreenBudget</Emphasize>, a user was allowed to reorder the rows on a given
        table view inside of the budget and it would automatically persist.
      </Description>
      <Description>
        This was a feature that was rather complicated to implement from a performance point of view
        because when a row is reordered, we needed to ensure that just that row is updated in the
        database (and not every row after it as well). To accomplish this, we had to develop a&nbsp;
        <InlineLink
          element='a'
          href='https://github.com/nickmflorin/happybudget-api/blob/develop/src/happybudget/app/tabling/utils.py'
          openInNewTab
        >
          lexicographical sorting algorithm
        </InlineLink>
        &nbsp;that would allow us to perform a reorder by just performing one database write,
        instead of updating potentially all the rows in the table.
      </Description>
      <Description>
        The other reason that this feature was difficult to implement was that the ordering of rows
        in a table inside of a production budget <i>means something</i>, in terms of how&nbsp;
        <Emphasize>Markup</Emphasize>(s) are applied and how <Emphasize>Group</Emphasize>(s) are
        determined, among other things.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          An example of a user moving a row in a given table view inside of a&nbsp;
          <Emphasize.Caption>GreenBudget</Emphasize.Caption> budget. Moving the row to a new
          location affects the <Emphasize.Caption>Group</Emphasize.Caption> structure of the view -
          which is why you observe the calculations for the two&nbsp;
          <Emphasize.Caption>Groups</Emphasize.Caption> in the table view changing after the row is
          moved.
        </CaptionDescription>
      }
      label='GreenBudget Reordering'
      src='/projects/greenbudget/reordering'
    />
  </Section>
);

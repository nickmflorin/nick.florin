import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const SubTotalingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Sub-Totaling'>
    <DescriptionGroup>
      <Description>
        The sub-totaling feature summarizes metrics for a <Emphasize>Group</Emphasize> of line items
        in any table inside the budget. Each <Emphasize>Group</Emphasize> is represented by a
        single, color-configured row in the table, and it includes every line item above that row up
        to either the top of the table or the previous <Emphasize>Group</Emphasize> row.
      </Description>
      <Description>
        The contents of a <Emphasize>Group</Emphasize> therefore depend on the ordering of the rows
        in the table, which means reordering rows can change what any given{' '}
        <Emphasize>Group</Emphasize> contains. Moving a row down the table may remove it from one{' '}
        <Emphasize>Group</Emphasize> near the top and add it to another below. Adding a new{' '}
        <Emphasize>Group</Emphasize> in the middle of the table, or removing one, can likewise cause
        the rows to be automatically reordered to match the new <Emphasize>Group</Emphasize>{' '}
        structure.
      </Description>
      <Description>
        Supporting row reordering and row grouping at the same time turned out to be a complicated
        problem in its own right.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={[
        <CaptionDescription key='0'>
          A user creating a new <Emphasize.Caption>Group</Emphasize.Caption> from the three
          highlighted rows in the table. Those rows had previously belonged to the{' '}
          <Emphasize.Caption>Group</Emphasize.Caption> named{' '}
          <Emphasize.Caption>Miscellaneous</Emphasize.Caption>, and they are removed from it at the
          same moment they are added to the new <Emphasize.Caption>Group</Emphasize.Caption>.
        </CaptionDescription>,
        <CaptionDescription key='1'>
          You can see the transition in the summarized values of the two{' '}
          <Emphasize.Caption>Groups</Emphasize.Caption>: when the new{' '}
          <Emphasize.Caption>Group</Emphasize.Caption> is created, the values of the{' '}
          <Emphasize.Caption>Miscellaneous Group</Emphasize.Caption> decrease by exactly the amount
          the new <Emphasize.Caption>Group</Emphasize.Caption> totals to.
        </CaptionDescription>,
      ]}
      label='GreenBudget Grouping'
      src='/projects/greenbudget/grouping'
    />
    <Description>
      <Emphasize>Groups</Emphasize> can also be created by selecting (checking) individual rows in
      the table.
    </Description>
    <ProjectVideo
      caption={
        <CaptionDescription isCentered>
          A user creating a new <Emphasize.Caption>Group</Emphasize.Caption> from the three checked
          rows in the table.
        </CaptionDescription>
      }
      label='GreenBudget Checkbox Grouping'
      src='/projects/greenbudget/grouping-from-checkboxes'
    />
    <Description>
      A row can be removed from the <Emphasize>Group</Emphasize> it belongs to either by dragging it
      out of the <Emphasize>Group</Emphasize> or by right-clicking it and choosing &quot;Remove from
      Group&quot; in the context menu.
    </Description>
    <ProjectVideo
      caption={
        <CaptionDescription>
          A user removing a row from the <Emphasize.Caption>Group</Emphasize.Caption> it belongs to.
          The row moves to the bottom of the table, underneath the last{' '}
          <Emphasize.Caption>Group</Emphasize.Caption>, because it no longer belongs to any{' '}
          <Emphasize.Caption>Group</Emphasize.Caption> in the table.
        </CaptionDescription>
      }
      label='GreenBudget Removing From Group'
      src='/projects/greenbudget/removing-from-group'
    />
  </Section>
);

import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const SubTotalingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Sub-Totaling'>
    <DescriptionGroup>
      <Description>
        The Sub-Totaling feature can be used to summarize metrics for a&nbsp;
        <Emphasize>Group</Emphasize> of line items belonging to any table inside of the budget.
        Each&#32;<Emphasize>Group</Emphasize>, which is represented by a single, colored-configured
        row in the table, includes all line items above the <Emphasize>Group</Emphasize> row up
        until either the top of the table is reached or another <Emphasize>Group</Emphasize> row is
        encountered.
      </Description>
      <Description>
        As such, the contents inside of each <Emphasize>Group</Emphasize> depend on the ordering of
        the rows in the table. This means that reordering rows can affect the contents of any
        given&nbsp;
        <Emphasize>Group</Emphasize> in the table. For example, moving a row down in the table may
        cause it to be removed from one <Emphasize>Group</Emphasize> towards the top of the table
        and added to another <Emphasize>Group</Emphasize> below it. Additionally, both adding a
        new&#32;<Emphasize>Group</Emphasize> in the middle of the table and/or removing a&nbsp;
        <Emphasize>Group</Emphasize> from the table in general can cause the rows of the table to be
        automatically reordered based on the new <Emphasize>Group</Emphasize> structure.
      </Description>
      <Description>
        With this in mind, it is clear that the ability to reorder rows in the table in conjunction
        with the ability to group rows in the table introduced a rather complicated problem that had
        to be solved in order to support both features in tandem.
      </Description>
    </DescriptionGroup>
    <ProjectImage
      alt='GreenBudget Grouping'
      caption={[
        <CaptionDescription key='0'>
          An example of a user creating a new <Emphasize.Caption>Group</Emphasize.Caption>
          &nbsp;from the 3 highlighted rows in the table. The rows in the newly created&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption>, which had previously belonged to the&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> named&nbsp;
          <Emphasize.Caption>Miscellaneous</Emphasize.Caption>, were removed from that&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> while being added to the new&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> simultaneously.
        </CaptionDescription>,
        <CaptionDescription key='1'>
          You can see this transition occur by focusing on the summarized, calculated values
          associated with both the&nbsp;
          <Emphasize.Caption>Miscellaneous Group</Emphasize.Caption>and the newly created&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> in the above image. When the new&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> is created, the summarized values of
          the&nbsp;
          <Emphasize.Caption>Miscellaneous Group</Emphasize.Caption>&nbsp;decrease by the same
          amount that the summarized values of the new&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> total to.
        </CaptionDescription>,
      ]}
      isUnoptimized
      src='/projects/greenbudget/grouping.gif'
    />
    <Description>
      <Emphasize>Group</Emphasize>(s) can also be created by selecting (checking) individual rows in
      the table.
    </Description>
    <ProjectImage
      alt='GreenBudget Checkbox Grouping'
      caption={
        <CaptionDescription isCentered>
          An example of a user creating a new <Emphasize.Caption>Group</Emphasize.Caption>
          &nbsp;from the 3 checked rows in the table.
        </CaptionDescription>
      }
      isUnoptimized
      src='/projects/greenbudget/grouping-from-checkboxes.gif'
    />
    <Description>
      Rows of the table can be removed from the <Emphasize>Group</Emphasize> they belong to by
      either dragging the row out of the <Emphasize>Group</Emphasize> or by right-clicking the row
      and selecting the &quot;Remove from Group&quot; option in the context menu.
    </Description>
    <ProjectImage
      alt='GreenBudget Removing From Group'
      caption={
        <CaptionDescription>
          An example of a user removing a row from the&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption> it belongs to. The row is moves to the bottom
          of the table, underneath the last&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption>, because it no longer belongs to any&nbsp;
          <Emphasize.Caption>Group</Emphasize.Caption>&nbsp;in the table.
        </CaptionDescription>
      }
      isUnoptimized
      src='/projects/greenbudget/removing-from-group.gif'
    />
  </Section>
);

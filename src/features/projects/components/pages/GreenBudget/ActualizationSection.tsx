import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const ActualizationSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Actualization'>
    <DescriptionGroup>
      <Description>
        In film production, an <Emphasize>Actual</Emphasize> is a term that is used to describe
        the&#32;<i>actual</i>, realized cost of a given line item in a budget. Sometimes (more often
        than not) the actual cost of a given line item differs from the line item&apos;s
        original&#32;<Emphasize>estimated</Emphasize> value, and the difference is referred to as
        the&nbsp;
        <Emphasize>variance</Emphasize>.
      </Description>
      <Description>
        In a production budget, <Emphasize>Actual</Emphasize>(s) are stored in separate tables - and
        then tied to individual line items of the budget through foreign-key relationships. This
        allows other information to be stored alongside the <Emphasize>Actual</Emphasize>, such as
        attachments, notes, etc. It is often the case that a producer will want to keep a record of,
        for instance, the receipts that were used to justify the actual cost of a line item.
      </Description>
    </DescriptionGroup>
    <ProjectImage
      alt='GreenBudget Actualization'
      caption={
        <CaptionDescription>
          An example of a user creating a new <Emphasize.Caption>Actual</Emphasize.Caption>, &nbsp;
          <Emphasize.Caption>1001-A-7</Emphasize.Caption>, and associating the&nbsp;
          <Emphasize.Caption>Actual</Emphasize.Caption>
          &nbsp;with the&nbsp;
          <Emphasize.Caption>Sub Account</Emphasize.Caption> for&nbsp;
          <Emphasize.Caption>Hotel Stay</Emphasize.Caption> costs in the budget.
        </CaptionDescription>
      }
      isUnoptimized
      src='/projects/greenbudget/actualization.gif'
    />
  </Section>
);

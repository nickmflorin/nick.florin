import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const ActualizationSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Actualization'>
    <DescriptionGroup>
      <Description>
        In film production, an <Emphasize>Actual</Emphasize> is the <i>actual</i>, realized cost of
        a line item in a budget. More often than not, the actual cost of a line item differs from
        its original <Emphasize>estimated</Emphasize> value, and the difference between the two is
        called the <Emphasize>variance</Emphasize>.
      </Description>
      <Description>
        In a production budget, <Emphasize>Actuals</Emphasize> are stored in separate tables and
        tied to individual line items through foreign-key relationships. This allows other
        information to be stored alongside each <Emphasize>Actual</Emphasize>, such as attachments
        and notes. A producer will often want to keep, for instance, the receipts that justify the
        actual cost of a line item.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          A user creating a new <Emphasize.Caption>Actual</Emphasize.Caption>,{' '}
          <Emphasize.Caption>1001-A-7</Emphasize.Caption>, and associating it with the{' '}
          <Emphasize.Caption>Sub Account</Emphasize.Caption> for{' '}
          <Emphasize.Caption>Hotel Stay</Emphasize.Caption> costs in the budget.
        </CaptionDescription>
      }
      label='GreenBudget Actualization'
      src='/projects/greenbudget/actualization'
    />
  </Section>
);

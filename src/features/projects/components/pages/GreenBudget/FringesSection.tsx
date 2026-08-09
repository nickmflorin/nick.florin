import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const FringesSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Fringes'>
    <Description>
      A <Emphasize>Fringe</Emphasize> is a percentage or flat-rate markup that can be applied to
      individual line items in a production budget, and a single <Emphasize>Fringe</Emphasize> is
      often reused across multiple line items and multiple tables. A <Emphasize>Fringe</Emphasize>{' '}
      affects the <Emphasize>estimated</Emphasize> value of any line item it is applied to, assuming
      it has a non-zero percentage or flat-rate value.
    </Description>
    <ProjectVideo
      caption={[
        <CaptionDescription key='0'>
          A user creating a new <Emphasize.Caption>Fringe</Emphasize.Caption>,{' '}
          <Emphasize.Caption>Fringe I</Emphasize.Caption>, and associating it with the{' '}
          <Emphasize.Caption>Sub Account</Emphasize.Caption> for{' '}
          <Emphasize.Caption>Accountants</Emphasize.Caption> in the budget.
        </CaptionDescription>,
        <CaptionDescription key='1'>
          The <Emphasize.Caption>Fringe</Emphasize.Caption> has a rate of 25% and a cutoff of
          $1,000.00, meaning it applies a 25% markup to the first $1,000.00 of the{' '}
          <Emphasize.Caption>Sub Account</Emphasize.Caption>&apos;s{' '}
          <Emphasize.Caption>estimated</Emphasize.Caption> value. You can see the{' '}
          <Emphasize.Caption>estimated</Emphasize.Caption> value of the{' '}
          <Emphasize.Caption>Sub Account</Emphasize.Caption> change from $11,250.00 to $11,500.00 as
          soon as the <Emphasize.Caption>Fringe</Emphasize.Caption> is applied.
        </CaptionDescription>,
      ]}
      label='GreenBudget Fringes'
      src='/projects/greenbudget/fringes'
    />
  </Section>
);

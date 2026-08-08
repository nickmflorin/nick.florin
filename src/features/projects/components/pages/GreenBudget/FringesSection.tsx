import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const FringesSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Fringes'>
    <Description>
      A <Emphasize>Fringe</Emphasize> represents a percentage or flat rate markup that can be
      applied to individual line items in a production budget. <Emphasize>Fringe</Emphasize>
      (s) are often reused across multiple line items in a table and across multiple tables in a
      budget. A <Emphasize>Fringe</Emphasize> will affect the&nbsp;
      <Emphasize>estimated</Emphasize> value of any line item it is applied to (assuming it has a
      non-zero percentage or flat rate value).
    </Description>
    <ProjectVideo
      caption={[
        <CaptionDescription key='0'>
          An example of a user creating a new <Emphasize.Caption>Fringe</Emphasize.Caption>, &nbsp;
          <Emphasize.Caption>Fringe I</Emphasize.Caption>, and associating the&nbsp;
          <Emphasize.Caption>Fringe</Emphasize.Caption>
          &nbsp;with the&nbsp;
          <Emphasize.Caption>Sub Account</Emphasize.Caption> for&nbsp;
          <Emphasize.Caption>Accountants</Emphasize.Caption> in the budget.
        </CaptionDescription>,
        <CaptionDescription key='1'>
          The <Emphasize.Caption>Fringe</Emphasize.Caption> has a percentage rate of 25%, and a
          cutoff of $1000.00. This means that it will apply a 25% markup to the first $1000.00 of
          the&nbsp;
          <Emphasize.Caption>Sub Account</Emphasize.Caption>&apos;s&nbsp;
          <Emphasize.Caption>estimated</Emphasize.Caption> value. You can see the&nbsp;
          <Emphasize.Caption>estimated</Emphasize.Caption> value of the&nbsp;
          <Emphasize.Caption>Sub Account</Emphasize.Caption>&nbsp;change from $11,250.00 to
          $11,500.00 immediately after the&nbsp;
          <Emphasize.Caption>Fringe</Emphasize.Caption> is applied in the above image.
        </CaptionDescription>,
      ]}
      label='GreenBudget Fringes'
      src='/projects/greenbudget/fringes'
    />
  </Section>
);

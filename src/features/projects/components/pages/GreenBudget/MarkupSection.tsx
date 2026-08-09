import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const MarkupSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Markup'>
    <DescriptionGroup>
      <Description>
        The <Emphasize>Markup</Emphasize> feature applies percentage or flat-rate markups to chosen
        rows in a table view. A <Emphasize>Markup</Emphasize> is treated as its own{' '}
        <Emphasize>Sub Account</Emphasize>, just without all the characteristics of a traditional
        one, and appears as a row in the table with special indicators that help users distinguish
        it from ordinary rows.
      </Description>
      <Description>
        Because a <Emphasize>Markup</Emphasize> behaves as a pseudo{' '}
        <Emphasize>Sub Account</Emphasize>, it contributes to the overall values of the parent
        table.
      </Description>
      <Description>
        <Emphasize>Markups</Emphasize> can be applied to rows in several ways, including checking
        individual rows and highlighting a portion of the table.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          A user creating a <Emphasize.Caption>Markup</Emphasize.Caption> and applying it to the
          selected rows in the table. The <Emphasize.Caption>Markup</Emphasize.Caption> applies a
          15% multiplier to the first four rows, contributing roughly an additional $800,000.00 to
          the estimated value of the table&apos;s parent.
        </CaptionDescription>
      }
      label='GreenBudget Markup'
      src='/projects/greenbudget/markup'
    />
  </Section>
);

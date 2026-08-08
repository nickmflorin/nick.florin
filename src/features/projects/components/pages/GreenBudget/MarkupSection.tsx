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
        The <Emphasize>Markup</Emphasize> feature can be used to apply percentage or flat rate
        markups to certain rows in a table view. <Emphasize>Markup</Emphasize>(s) - which are
        treated as separate <Emphasize>Sub Account</Emphasize>(s) in the table, just without all the
        characteristics of a traditional <Emphasize>Sub Account</Emphasize> - appear as rows in the
        table with special indicators that aid users in differentiating them from other, non-
        <Emphasize>Markup</Emphasize> rows.
      </Description>
      <Description>
        Since <Emphasize>Markup</Emphasize>(s) are treated as a pseudo-
        <Emphasize>Sub Account</Emphasize>, they contribute to the overall values of the parent
        table.
      </Description>
      <Description>
        <Emphasize>Markup</Emphasize>(s) can be applied to rows in the table in a variety of
        different ways, including checkbox selection of rows and highlighting certain portions of
        the table.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          An example of a user creating a <Emphasize.Caption>Markup</Emphasize.Caption> and applying
          it to the selected rows in the table. The&nbsp;
          <Emphasize.Caption>Markup</Emphasize.Caption> applies a 15% multiplier to the first 4 rows
          of the table, contributing (roughly) an additional ~$800,000.00 to the estimated value of
          the table&apos;s parent.
        </CaptionDescription>
      }
      label='GreenBudget Markup'
      src='/projects/greenbudget/markup'
    />
  </Section>
);

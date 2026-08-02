import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const IntelligentAutocompleteSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Intelligent Autocomplete'>
    <Description>
      <Emphasize>Greenbudget</Emphasize> incorporated an intelligent system of deterministic
      algorithms for making education guesses about what the values of newly created rows might be
      based on patterns that it detects in previously created rows.
    </Description>
    <ProjectImage
      alt='GreenBudget Autocomplete'
      caption={
        <CaptionDescription>
          An example of <Emphasize.Caption>Greenbudget</Emphasize.Caption>&apos;s autocomplete
          algorithms at work. When the user double-clicks&nbsp;
          <Emphasize.Caption>Enter</Emphasize.Caption> while at the bottom of the table,&nbsp;
          <Emphasize.Caption>Greenbudget</Emphasize.Caption> automatically creates a new row and
          makes education guesses as to what certain values in the new row should be.
        </CaptionDescription>
      }
      isUnoptimized
      src='/projects/greenbudget/autocomplete.gif'
    />
  </Section>
);

import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const IntelligentAutocompleteSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Intelligent Autocomplete'>
    <Description>
      <Emphasize>GreenBudget</Emphasize> included a system of deterministic algorithms that make
      educated guesses about the values of newly created rows, based on patterns detected in the
      rows created before them.
    </Description>
    <ProjectVideo
      caption={
        <CaptionDescription>
          <Emphasize.Caption>GreenBudget</Emphasize.Caption>&apos;s autocomplete algorithms at work.
          When the user presses <Emphasize.Caption>Enter</Emphasize.Caption> twice at the bottom of
          the table, <Emphasize.Caption>GreenBudget</Emphasize.Caption> automatically creates a new
          row and fills in educated guesses for several of its values.
        </CaptionDescription>
      }
      label='GreenBudget Autocomplete'
      src='/projects/greenbudget/autocomplete'
    />
  </Section>
);

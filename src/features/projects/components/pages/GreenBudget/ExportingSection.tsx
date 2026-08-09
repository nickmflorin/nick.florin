import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const ExportingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Exporting'>
    <Description>
      <Emphasize>GreenBudget</Emphasize> could export a budget, or portions of one, in a variety of
      forms. The most valued of these was the ability to export a budget as a customizable PDF
      document.
    </Description>
    <ProjectImage
      alt='GreenBudget Exports'
      caption={
        <DescriptionGroup>
          <CaptionDescription>
            A user exporting a budget as a PDF in <Emphasize.Caption>GreenBudget</Emphasize.Caption>
            . The document was highly customizable: users could add cover images and custom headers,
            and choose exactly which portions of the budget to include.
          </CaptionDescription>
          <CaptionDescription>
            The export feature included a live preview, which let the user see what the exported PDF
            would look like before actually exporting it.
          </CaptionDescription>
        </DescriptionGroup>
      }
      src='/projects/greenbudget/exporting.png'
    />
    <ProjectImage
      alt='GreenBudget Exporting'
      caption={
        <CaptionDescription>
          The live preview showing what the budget&apos;s{' '}
          <Emphasize.Caption>Top Sheet</Emphasize.Caption> will look like once exported.
        </CaptionDescription>
      }
      src='/projects/greenbudget/exporting-top-sheet.png'
    />
  </Section>
);

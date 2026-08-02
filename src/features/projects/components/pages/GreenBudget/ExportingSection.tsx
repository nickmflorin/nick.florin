import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const ExportingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Exporting'>
    <Description>
      <Emphasize>Greenbudget</Emphasize> supported comprehensive export features, which allowed a
      user to export a budget in the application in a variety of different forms. The most valued
      export feature was the ability to export a budget, or portions of a budget, as a customizable
      PDF document.
    </Description>
    <ProjectImage
      alt='GreenBudget Exports'
      caption={
        <DescriptionGroup>
          <CaptionDescription>
            An example of user exporting a PDF budget in&nbsp;
            <Emphasize.Caption>Greenbudget</Emphasize.Caption>. The PDF document allowed for
            flexible customization, including the ability to add cover images, custom headers, and
            selectively choose which portions of the budget to include in the export.
          </CaptionDescription>
          <CaptionDescription>
            The export feature included a &apos;Live Preview&apos; sub-feature, which allowed the
            user to see what the exported PDF would like like before it was actually exported.
          </CaptionDescription>
        </DescriptionGroup>
      }
      src='/projects/greenbudget/exporting.png'
    />
    <ProjectImage
      alt='GreenBudget Exporting'
      caption={
        <CaptionDescription>
          An example of the &apos;Live Preview&apos; feature showing the user what the
          budget&apos;&#32;<Emphasize.Caption>Top Sheet</Emphasize.Caption> would look like when the
          budget is exported.
        </CaptionDescription>
      }
      src='/projects/greenbudget/exporting-top-sheet.png'
    />
  </Section>
);

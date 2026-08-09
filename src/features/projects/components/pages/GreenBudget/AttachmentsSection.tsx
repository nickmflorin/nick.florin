import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const AttachmentsSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Attachments'>
    <Description>
      <Emphasize>GreenBudget</Emphasize> let users upload files and attach them to individual rows
      of both the budget and the actuals tables. This was a very popular feature, because it kept
      receipts, invoices and contracts on record directly inside the budget itself.
    </Description>
    <ProjectVideo
      caption={
        <DescriptionGroup>
          <CaptionDescription>
            A user uploading an attachment for a row in the <Emphasize>Sub Account</Emphasize> view
            of a budget.
          </CaptionDescription>
          <CaptionDescription>
            Like any other cell, attachment cells could be copied, pasted and filled across a range
            of cells with a simple drag and drop.
          </CaptionDescription>
        </DescriptionGroup>
      }
      label='GreenBudget Attachments'
      src='/projects/greenbudget/attachments'
    />
  </Section>
);

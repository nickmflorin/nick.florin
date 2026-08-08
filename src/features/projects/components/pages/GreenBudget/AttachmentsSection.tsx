import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const AttachmentsSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Attachments'>
    <Description>
      <Emphasize>Greenbudget</Emphasize> allowed users to upload files and associate those files
      with individual rows of both the budget and the actuals tables. This was a very popular
      feature, as it allowed users to keep a record of receipts, invoices and contracts directly in
      the budget itself.
    </Description>
    <ProjectVideo
      caption={
        <DescriptionGroup>
          <CaptionDescription>
            An example of user uploading an attachment for a row in the &nbsp;
            <Emphasize>Sub Account</Emphasize>(s) table view inside of a budget.
          </CaptionDescription>
          <CaptionDescription>
            Just like all other cells, attachment cells could be copy/pasted and copied over a range
            of cells with a simple drag and drop.
          </CaptionDescription>
        </DescriptionGroup>
      }
      label='GreenBudget Attachments'
      src='/projects/greenbudget/attachments'
    />
  </Section>
);

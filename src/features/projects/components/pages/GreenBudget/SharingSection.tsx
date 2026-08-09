import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const SharingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Sharing'>
    <Description>
      Alongside its access-control policies and multi-user collaboration,{' '}
      <Emphasize>GreenBudget</Emphasize> could produce a read-only version of a budget, available to
      anyone through a shareable link.
    </Description>
    <ProjectImage
      alt='GreenBudget Share View'
      caption={
        <CaptionDescription>
          A user creating a private, shareable link for a budget. Anyone given the link sees a
          read-only version of the budget, with certain data hidden in a configurable fashion.
        </CaptionDescription>
      }
      src='/projects/greenbudget/share-view.png'
    />
  </Section>
);

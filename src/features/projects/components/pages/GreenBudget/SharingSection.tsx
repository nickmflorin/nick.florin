import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const SharingSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Sharing'>
    <Description>
      While <Emphasize>Greenbudget</Emphasize> supported access control policies and multi-user
      collaboration on budgets, it also included the ability to create read-only versions of a
      budget that could be shared with a shareable link.
    </Description>
    <ProjectImage
      alt='GreenBudget Share View'
      caption={
        <CaptionDescription>
          An example of a user creating a private, shareable link for the budget. When other users
          (who have been given the link) visit it, they are presented with a read-only version of
          the budget, with certain data hidden in a configurable fashion.
        </CaptionDescription>
      }
      src='/projects/greenbudget/share-view.png'
    />
  </Section>
);

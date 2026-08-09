import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const MobileSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Mobile'>
    <Description>
      Producers need access to their budgets on the go, so <Emphasize>GreenBudget</Emphasize> put
      real emphasis on its tablet and mobile experiences, letting users view, manage and update
      their budgets from any device.
    </Description>
    <ProjectImage
      alt='GreenBudget Mobile'
      caption={
        <CaptionDescription isCentered>
          A user viewing overall budget metrics on a mobile device in{' '}
          <Emphasize.Caption>GreenBudget</Emphasize.Caption>.
        </CaptionDescription>
      }
      src='/projects/greenbudget/mobile-analysis.png'
      wrapperClassName='max-h-[500px] mx-auto'
    />
  </Section>
);

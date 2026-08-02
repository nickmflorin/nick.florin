import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const MobileSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Mobile'>
    <Description>
      It is important for producers to be able to access their budgets on the go. As such,
      <Emphasize>Greenbudget</Emphasize> emphasized its tablet and mobile experiences, allowing
      users to view, manage and update their budgets on the go.
    </Description>
    <ProjectImage
      alt='GreenBudget Mobile'
      caption={
        <CaptionDescription isCentered>
          An example of a user viewing overall budget metrics on a mobile device in&nbsp;
          <Emphasize.Caption>Greenbudget</Emphasize.Caption>.
        </CaptionDescription>
      }
      src='/projects/greenbudget/mobile-analysis.png'
      wrapperClassName='max-h-[500px] mx-auto'
    />
  </Section>
);

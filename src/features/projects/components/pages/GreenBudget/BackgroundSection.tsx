import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export const BackgroundSection = () => (
  <Section hasMarginBottom={false} title='Background'>
    <DescriptionGroup>
      <Description>
        Film producers do not manage budgets the way people in other industries do, and standard
        accounting and budgeting tools do not work for them. Most producers relied on some
        combination of overly complicated internal spreadsheets with custom macros, third-party
        Excel integrations and the popular MovieMagic budgeting software, a desktop-only,
        single-tenant, expensive and severely outdated product.
      </Description>
      <Description>
        When a film producer in Los Angeles approached me with an idea to modernize film budgeting
        with a web-based, multi-user, collaborative solution built specifically for film production,
        I thought it was a great one. We began working together on what would eventually become{' '}
        <Emphasize>GreenBudget</Emphasize>.
      </Description>
    </DescriptionGroup>
    <ProjectImage
      alt='GreenBudget Landing Page'
      caption={
        <CaptionDescription isCentered>
          <Emphasize.Caption>GreenBudget</Emphasize.Caption>&apos;s original landing page.
        </CaptionDescription>
      }
      src='/projects/greenbudget/landing.png'
    />
  </Section>
);

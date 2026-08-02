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
        The way that film producers manage budgets is different than how people in any other
        industry manage budgets - standard, general accounting/budgeting tools do not work. The
        majority of (if not all) producers relied on a combination of internal, overly-complicated
        spreadsheets with custom macros, third-party Excel integrations and/or the popular
        MovieMagic budgeting software - which is a desktop-only, single tenant, expensive and
        severely outdated piece of software.
      </Description>
      <Description>
        When I was approached by a film producer out in Los Angeles, CA with an idea to modernize
        film budgeting with a web-based, mult-user, collaborative solution tailored specifically
        towards film production, I thought it was a great idea - and we began working together on
        what would eventually become <Emphasize>GreenBudget</Emphasize>.
      </Description>
    </DescriptionGroup>
    <ProjectImage
      alt='GreenBudget Landing Page'
      caption={
        <CaptionDescription isCentered>
          <Emphasize.Caption>GreenBudget</Emphasize.Caption>&apos;s original landing/slash page.
        </CaptionDescription>
      }
      src='/projects/greenbudget/landing.png'
    />
  </Section>
);

import { type JSX } from 'react';

import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { Project, type ProjectProps } from '~/features/projects/components/Project';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section, SectionTitle } from '~/features/projects/components/Section';

export interface WebsiteProps extends Omit<ProjectProps, 'children' | 'description' | 'title'> {}

export const Website = (props: WebsiteProps): JSX.Element => (
  <Project
    description={
      <Description>
        A CMS-powered, interactive personal portfolio and website written in{' '}
        <InlineLink element='a' href='https://nextjs.org/'>
          NextJS
        </InlineLink>
        .
      </Description>
    }
    title={props.project.name}
    {...props}
  >
    <Section hasMarginBottom={false} title='Internal Component Library'>
      <DescriptionGroup>
        <Description>
          The application does not rely on a third-party component library. Instead, it uses an
          internal component library built with{' '}
          <InlineLink element='a' href='https://sass-lang.com/'>
            SASS
          </InlineLink>{' '}
          and{' '}
          <InlineLink element='a' href='https://tailwindcss.com/'>
            TailwindCSS
          </InlineLink>
          , along with tooling libraries such as{' '}
          <InlineLink element='a' href='https://floating-ui.com/'>
            Floating UI
          </InlineLink>{' '}
          and{' '}
          <InlineLink element='a' href='https://www.framer.com/motion/'>
            Framer Motion
          </InlineLink>
          .
        </Description>
        <Description>
          This choice was primarily an experiment, meant to gauge the difficulty, limitations and
          benefits of forgoing a third-party component library like{' '}
          <InlineLink element='a' href='https://mantine.dev/'>
            Mantine
          </InlineLink>{' '}
          or{' '}
          <InlineLink element='a' href='https://chakra-ui.com/'>
            Chakra UI
          </InlineLink>
          .
        </Description>
        <Description className='italic'>
          Disclosure:{' '}
          <InlineLink element='a' href='https://mantine.dev/'>
            Mantine
          </InlineLink>{' '}
          is used in a couple of places where building the component internally made no sense.
        </Description>
      </DescriptionGroup>
    </Section>
    <Section hasMarginBottom={false} title={<SectionTitle>Skill-Centric Design</SectionTitle>}>
      <DescriptionGroup>
        <Description>
          The application is designed around the concept of a <Emphasize>Skill</Emphasize>: a
          particular ability or expertise developed over an academic or professional career, such as{' '}
          <InlineLink element='a' href='https://nextjs.org/'>
            NextJS
          </InlineLink>
          .
        </Description>
        <Description>
          A <Emphasize>Skill</Emphasize> can be associated with any other model in the application,
          such as an <Emphasize>Experience</Emphasize> or a <Emphasize>Project</Emphasize>, via the
          admin-only CMS. The dates during which those associated models were relevant are then used
          to dynamically reconstruct experience metrics, usually in years, for every{' '}
          <Emphasize>Skill</Emphasize> in the application.
        </Description>
      </DescriptionGroup>
      <ProjectImage
        alt='Modifying Skills'
        caption={
          <CaptionDescription>
            <Emphasize.Caption>Skills</Emphasize.Caption> can be created, modified and deleted in
            the admin-only CMS. Associating a <Emphasize.Caption>Skill</Emphasize.Caption> with
            other models in the application factors into the experience metrics calculated for it.
          </CaptionDescription>
        }
        src='/projects/website/modifying-skills.png'
      />
      <ProjectImage
        alt='Modifying Courses'
        caption={
          <CaptionDescription>
            The relationship can also be edited in the other direction. Here, the{' '}
            <Emphasize.Caption>Skills</Emphasize.Caption> associated with a{' '}
            <Emphasize.Caption>Course</Emphasize.Caption> are being modified, which affects the
            academic experience metrics of each <Emphasize.Caption>Skill</Emphasize.Caption> that is
            added or removed, since every <Emphasize.Caption>Course</Emphasize.Caption> is tied to
            an <Emphasize.Caption>Education</Emphasize.Caption> with a specific start and end date.
          </CaptionDescription>
        }
        src='/projects/website/modifying-courses.png'
      />
      <Description>
        All of the application&apos;s content can be modified directly in the admin-only CMS,
        including the experience history shown on the{' '}
        <InlineLink element='link' href='/'>
          Dashboard
        </InlineLink>{' '}
        and{' '}
        <InlineLink element='link' href='/resume/experience'>
          Resume
        </InlineLink>{' '}
        pages.
      </Description>
      <ProjectImage
        alt='Modifying Experience'
        caption={['Modifying experience history in the admin-only CMS.']}
        isCaptionCentered
        src='/projects/website/modifying-experience.png'
      />
    </Section>
    <Section hasMarginBottom={false} title='Integrations'>
      <DescriptionGroup>
        <Description>
          The application integrates directly with APIs from sources such as{' '}
          <InlineLink element='a' href='https://linkedin.com/'>
            LinkedIn
          </InlineLink>{' '}
          and{' '}
          <InlineLink element='a' href='https://github.com/'>
            GitHub
          </InlineLink>
          , so relevant data can be imported from those sources and reconciled with internal data.
        </Description>
        <ProjectImage
          alt='Modifying Repositories'
          caption={[
            'Choosing which repositories are visible in the application after they are ' +
              "imported via GitHub's API.",
          ]}
          isCaptionCentered
          src='/projects/website/modifying-repositories.png'
        />
      </DescriptionGroup>
    </Section>
    <Section hasMarginBottom={false} title='Resume Management'>
      <DescriptionGroup>
        <Description>
          Resumes can be managed directly in the admin-only CMS. They can be uploaded, deleted and
          toggled between, with a single, most up-to-date resume exposed for public viewing and
          download in the application.
        </Description>
        <div className='flex flex-row gap-[24px]'>
          <ProjectImage
            alt='Uploading Resumes'
            caption={['Uploading resumes in the admin-only CMS.']}
            isCaptionCentered
            src='/projects/website/uploading-resumes.png'
          />
          <ProjectImage
            alt='Modifying Resumes'
            caption={['Modifying resumes in the admin-only CMS.']}
            isCaptionCentered
            src='/projects/website/modifying-resumes.png'
          />
        </div>
      </DescriptionGroup>
    </Section>
  </Project>
);

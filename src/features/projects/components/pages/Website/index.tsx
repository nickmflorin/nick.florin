import { InlineLink } from "~/components/buttons";
import { Description } from "~/components/typography";
import { CaptionDescription } from "~/features/projects/components/CaptionDescription";
import { DescriptionGroup } from "~/features/projects/components/DescriptionGroup";
import { Emphasize } from "~/features/projects/components/Emphasize";
import { Project, type ProjectProps } from "~/features/projects/components/Project";
import { ProjectImage } from "~/features/projects/components/ProjectImage";
import { Section, SectionTitle } from "~/features/projects/components/Section";

export interface WebsiteProps extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const Website = (props: WebsiteProps): JSX.Element => (
  <Project
    title={props.project.name}
    description={
      <Description>
        A CMS-powered, interactive and dynamic personal portfolio/website written using&nbsp;
        <InlineLink element="a" href="https://nextjs.org/">
          NextJS
        </InlineLink>
        .
      </Description>
    }
    {...props}
  >
    <Section title="Internal Component Library" marginBottom={false}>
      <DescriptionGroup>
        <Description>
          The application does not rely on any third-party component library. Instead, it leverages
          an internal component library developed using frameworks like&nbsp;
          <InlineLink element="a" href="https://sass-lang.com/">
            SASS
          </InlineLink>
          &nbsp;and&nbsp;
          <InlineLink element="a" href="https://tailwindcss.com/">
            TailwindCSS
          </InlineLink>
          ,&nbsp;along with tooling libraries such as&nbsp;
          <InlineLink element="a" href="https://floating-ui.com/">
            Floating UI
          </InlineLink>
          &nbsp;and&nbsp;
          <InlineLink element="a" href="https://www.framer.com/motion/">
            Framer Motion
          </InlineLink>
          .
        </Description>
        <Description>
          This choice was made primarily as an experiment - to gauge the difficulty, feasibility,
          limitations and benefits of avoiding a third-party component library like&nbsp;
          <InlineLink element="a" href="https://mantine.dev/">
            Mantine
          </InlineLink>
          &nbsp;or&nbsp;
          <InlineLink element="a" href="https://chakra-ui.com/">
            Chakra UI
          </InlineLink>
          .
        </Description>
        <Description className="italic">
          Disclosure:&nbsp;
          <InlineLink element="a" href="https://mantine.dev/">
            Mantine
          </InlineLink>
          &nbsp;was used to a minimal extent in a couple of places where it did not make any sense
          to develop the component internally.
        </Description>
      </DescriptionGroup>
    </Section>
    <Section title={<SectionTitle>Skill-Centric Design</SectionTitle>} marginBottom={false}>
      <DescriptionGroup>
        <Description>
          The application was designed with the concept of a <Emphasize>Skill</Emphasize> at its
          core. A&nbsp;
          <Emphasize>Skill</Emphasize>&nbsp;represents a particular ability or expertise learned
          throughout an academic and/or professional career, such as&nbsp;
          <InlineLink element="a" href="https://nextjs.org/">
            NextJS
          </InlineLink>
          .
        </Description>
        <Description>
          <Emphasize>Skill</Emphasize>(s) can then be associated with all other models in the
          application via the admin-only CMS, such as an <Emphasize>Experience</Emphasize> or&nbsp;
          <Emphasize>Project</Emphasize>. The dates for which the associated models were relevant
          can then be used to dynamically reconstruct experience metrics (usually in years) for
          every <Emphasize>Skill</Emphasize> in the application.
        </Description>
      </DescriptionGroup>
      <ProjectImage
        src="/projects/website/modifying-skills.png"
        alt="Modifying Skills"
        caption={
          <CaptionDescription>
            <Emphasize.Caption>Skill</Emphasize.Caption>(s) can be modified, deleted and/or created
            via the admin-only CMS. Skill(s) can then be associated with other models in the
            application, which factor into the calculation of experience metrics for each Skill it
            relates to.
          </CaptionDescription>
        }
      />
      <ProjectImage
        src="/projects/website/modifying-courses.png"
        alt="Modifying Courses"
        caption={
          <CaptionDescription>
            The relationship between <Emphasize.Caption>Skill</Emphasize.Caption>(s) and associated
            models can also be modified in the reverse direction. Here, the&nbsp;
            <Emphasize.Caption>Skill</Emphasize.Caption>(s) associated with a&nbsp;
            <Emphasize.Caption>Course</Emphasize.Caption> are being modified. This will affect the
            academic experience metrics for each <Emphasize.Caption>Skill</Emphasize.Caption> that
            is added to or removed from the
            <Emphasize.Caption>Course</Emphasize.Caption>, since each&nbsp;
            <Emphasize.Caption>Course</Emphasize.Caption> is tied to an&nbsp;
            <Emphasize.Caption>Education</Emphasize.Caption> model with a specific start and end
            date.
          </CaptionDescription>
        }
      />
      <Description>
        All of the content of the application can be dynamically modified directly via the
        admin-only CMS. This includes the ability to modify, create, delete and update the
        experience history viewable on the&nbsp;
        <InlineLink element="link" href="/">
          Dashboard
        </InlineLink>
        &nbsp;or&nbsp;
        <InlineLink element="link" href="/resume/experience">
          Resume
        </InlineLink>
        &nbsp;pages.
      </Description>
      <ProjectImage
        src="/projects/website/modifying-experience.png"
        alt="Modifying Experience"
        captionCentered
        caption={["Modifying experience history via the admin-only CMS."]}
      />
    </Section>
    <Section title="Integrations" marginBottom={false}>
      <DescriptionGroup>
        <Description>
          The application integrates directly with APIs from sources such as&nbsp;
          <InlineLink element="a" href="https://linkedin.com/">
            LinkedIn
          </InlineLink>
          &nbsp;and&nbsp;
          <InlineLink element="a" href="https://github.com/">
            GitHub
          </InlineLink>
          ,&nbsp;allowing relevant data to be prepopulated or imported directly from these sources,
          and then reconciled with internal data.
        </Description>
        <ProjectImage
          src="/projects/website/modifying-repositories.png"
          alt="Modifying Experience"
          captionCentered
          caption={[
            "Modifying the repositories visible in the application after they are imported via " +
              "GitHub's API.",
          ]}
        />
      </DescriptionGroup>
    </Section>
    <Section title="Resume Management" marginBottom={false}>
      <DescriptionGroup>
        <Description>
          The application offers the ability to manage resume(s) directly in the admin-only CMS.
          Resumes can be uploaded, deleted and toggled between, with the ability to expose a
          specific, most up-to-date resume for public download and viewing in the application.
        </Description>
        <div className="flex flex-row gap-[24px]">
          <ProjectImage
            src="/projects/website/uploading-resumes.png"
            alt="Uploading Resumes"
            caption={["Uploading resumes via the admin-only CMS."]}
            captionCentered
          />
          <ProjectImage
            src="/projects/website/modifying-resumes.png"
            alt="Modifying Resumes"
            caption={["Modifying resumes via the admin-only CMS."]}
            captionCentered
          />
        </div>
      </DescriptionGroup>
    </Section>
  </Project>
);

export default Website;

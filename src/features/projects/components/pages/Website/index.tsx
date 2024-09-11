import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";

import { CaptionDescription } from "../CaptionDescription";
import { DescriptionGroup } from "../DescriptionGroup";
import { Emphasize } from "../Emphasize";
import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";
import { Section } from "../Section";

export interface WebsiteProps extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const Website = (props: WebsiteProps): JSX.Element => (
  <Project
    title={props.project.name}
    description={
      <Description>
        A CMS-powered, interactive and dynamic personal portfolio/website written using&nbsp;
        <Link as="a" href="https://nextjs.org/">
          NextJS
        </Link>
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
          <Link as="a" href="https://sass-lang.com/">
            SASS
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://tailwindcss.com/">
            TailwindCSS
          </Link>
          ,&nbsp;along with tooling libraries such as&nbsp;
          <Link as="a" href="https://floating-ui.com/">
            Floating UI
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://www.framer.com/motion/">
            Framer Motion
          </Link>
          .
        </Description>
        <Description>
          This choice was made primarily as an experiment - to gauge the difficulty, feasibility,
          limitations and benefits of avoiding a third-party component library like&nbsp;
          <Link as="a" href="https://mantine.dev/">
            Mantine
          </Link>
          &nbsp;or&nbsp;
          <Link as="a" href="https://chakra-ui.com/">
            Chakra UI
          </Link>
          .
        </Description>
        <Description className="italic">
          Disclosure:&nbsp;
          <Link as="a" href="https://mantine.dev/">
            Mantine
          </Link>
          &nbsp;was used to a minimal extent in a couple of places where it did not make any sense
          to develop the component internally.
        </Description>
      </DescriptionGroup>
    </Section>
    <Section title="<Emphasize>Skill</Emphasize>-Centric Design" marginBottom={false}>
      <DescriptionGroup>
        <Description>
          The application was designed with the concept of a <Emphasize>Skill</Emphasize> at its
          core. A&nbsp;
          <Emphasize>Skill</Emphasize>&nbsp;represents a particular ability or expertise learned
          throughout an academic and/or professional career, such as&nbsp;
          <Link as="a" href="https://nextjs.org/">
            NextJS
          </Link>
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
        <Link as="link" href="/">
          Dashboard
        </Link>
        &nbsp;or&nbsp;
        <Link as="link" href="/resume/experience">
          Resume
        </Link>
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
          <Link as="a" href="https://linkedin.com/">
            LinkedIn
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://github.com/">
            GitHub
          </Link>
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

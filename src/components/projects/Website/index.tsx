import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";

import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";
import { ProjectImageWrapper } from "../ProjectImageWrapper";
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
      <div className="flex flex-col gap-[8px]">
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
      </div>
    </Section>
    <Section title="Skill-Centric Design" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          The application was designed with the concept of a <i>Skill</i> at its core. A&nbsp;
          <i>Skill</i>&nbsp;represents a particular ability or expertise learned throughout an
          academic and/or professional career, such as&nbsp;
          <Link as="a" href="https://nextjs.org/">
            NextJS
          </Link>
          .
        </Description>
        <Description>
          <i>Skill</i>(s) can then be associated with all other models in the application via the
          admin-only CMS, such as an <i>Experience</i> or <i>Project</i>. The dates for which the
          associated models were relevant can then be used to dynamically reconstruct experience
          metrics (usually in years) for every <i>Skill</i> in the application.
        </Description>
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/website/modifying-skills.png"
          alt="Modifying Skills"
          caption={[
            "Skill(s) can be modified, deleted and/or created via the admin-only CMS.  Skill(s) " +
              "can then be associated with other models in the application, which factor " +
              "into the calculation of experience metrics for each Skill it relates to.",
          ]}
        />
      </ProjectImageWrapper>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/website/modifying-courses.png"
          alt="Modifying Courses"
          caption={[
            "The relationship between Skill(s) and associated models can also be modified in the " +
              "reverse direction.  Here, the Skill(s) associated with a Course are being " +
              "modified. This will affect the academic experience metrics for each Skill that " +
              "is added to or removed from the Course, since each Course is tied to an " +
              "Education model with a specific start and end date.",
          ]}
        />
      </ProjectImageWrapper>
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
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/website/modifying-experience.png"
          alt="Modifying Experience"
          caption={["Modifying experience history via the admin-only CMS."]}
        />
      </ProjectImageWrapper>
    </Section>
    <Section title="Integrations" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
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
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/website/modifying-repositories.png"
            alt="Modifying Experience"
            caption={[
              "Modifying the repositories visible in the application after they are imported via " +
                "GitHub's API.",
            ]}
          />
        </ProjectImageWrapper>
      </div>
    </Section>
    <Section title="Resume Management" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          The application offers the ability to manage resume(s) directly in the admin-only CMS.
          Resumes can be uploaded, deleted and toggled between, with the ability to expose a
          specific, most up-to-date resume for public download and viewing in the application.
        </Description>
        <ProjectImageWrapper className="mt-[8px]">
          <div className="flex flex-row gap-[24px]">
            <ProjectImage
              src="/projects/website/uploading-resumes.png"
              alt="Uploading Resumes"
              caption={["Uploading resumes via the admin-only CMS."]}
            />
            <ProjectImage
              src="/projects/website/modifying-resumes.png"
              alt="Modifying Resumes"
              caption={["Modifying resumes via the admin-only CMS."]}
            />
          </div>
        </ProjectImageWrapper>
      </div>
    </Section>
  </Project>
);

export default Website;

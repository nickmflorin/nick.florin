import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";

import { Disclaimer } from "../Disclaimer";
import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";
import { ProjectImageWrapper } from "../ProjectImageWrapper";
import { Section } from "../Section";

export interface GreenBudgetProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const GreenBudget = (props: GreenBudgetProps): JSX.Element => (
  <Project
    title={props.project.name}
    underConstruction
    description={
      <div className="flex flex-col gap-[6px]">
        <Description>
          <span className="font-medium text-text">GreenBudget</span> is an application that was
          created to address a niche market opportunity by providing a modern, web-based, multi-user
          collaborative budgeting solution for the film production industry. It replaced many
          outdated, inflexible and somewhat manual solutions that previously existed in the market.
        </Description>
        <Description>
          <span className="font-medium text-text">GreenBudget</span> is powered by a&nbsp;
          <Link as="a" href="https://react.dev/">
            React
          </Link>
          &nbsp;frontend consuming a powerful, REST API written using&nbsp;
          <Link as="a" href="https://www.djangoproject.com/">
            Django
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://www.django-rest-framework.org/">
            Django REST Framework
          </Link>
          &nbsp; on the server. At the time in which I stopped working on the project, we were in
          the midst of transitioning the frontend to&nbsp;
          <Link as="a" href="https://nextjs.org/">
            NextJS
          </Link>
          .
        </Description>
        <Description>
          The application relies on several different open-source tabling libraries interwoven with
          a large amount of internal, custom built tabling mechanics, that operate with the help of
          technology such as&nbsp;
          <Link as="a" href="https://react-redux.js.org/">
            React Redux
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://redux-saga.js.org/">
            Redux Sagas
          </Link>
          .
        </Description>
        <Description>
          By the time I stopped working on the project,&nbsp;
          <span className="font-medium text-text">GreenBudget</span>&nbsp;boasted a&nbsp;
          <i>couple thousand subscribed (paying) users</i>&nbsp;and had drawn interest from a number
          of enterprise clients who had expressed interest in adopting the platform for their own
          use.
        </Description>
      </div>
    }
    {...props}
  >
    <Disclaimer className="mt-3 mb-3">
      <div className="flex flex-col gap-2">
        <Description>
          Throughout the development of <span className="font-medium text-text">GreenBudget</span>,
          I was working closely with a film producer in Los Angeles, CA. Unfortunately, after 2
          years of development, he stole the software from me, and decided to relaunch it on servers
          that only he had access to.
        </Description>
        <Description>
          After approximately 8 months of GreenBudget running on these new servers, he was forced to
          shut the servers down. However, a few months later, GreenBudget had been rebranded and
          expanded upon, and was subsequently launched under what is now called&nbsp;
          <Link as="a" href="https://saturation.io/">
            Saturation IO
          </Link>
          .
        </Description>
        <Description>
          After this occurred, I decided to change the official name of the project from&nbsp;
          <span className="font-medium text-text">GreenBudget</span>&nbsp;to&nbsp;
          <span className="font-medium text-text">HappyBudget</span>, to ensure that I was not
          incidentally infringing on a trademark. This is why you will sometimes see the project
          referred to as&nbsp;
          <span className="font-medium text-text">HappyBudget</span>, but&nbsp;
          <span className="font-medium text-text">GreenBudget</span>&nbsp;still remains as the
          legacy.
        </Description>
        <Description>
          The circumstances of this situation are still being worked out today. If you are
          interested in learning more, feel free to reach out to me directly.
        </Description>
      </div>
    </Disclaimer>
    <Section title="Background" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Description>
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/greenbudget/landing.png"
          alt="GreenBudget Landing Page"
          caption={[
            "Users can view all of the products listed on the company's website and subscribe to " +
              "receive notifications for various events that may occur for a given product.",
          ]}
        />
      </ProjectImageWrapper>
    </Section>
    <Section title="Concepts" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Description>
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/greenbudget/topsheet.png"
          alt="GreenBudget Top Sheet"
          caption={[
            "Users can view all of the products listed on the company's website and subscribe to " +
              "receive notifications for various events that may occur for a given product.",
          ]}
        />
      </ProjectImageWrapper>
      <div className="flex flex-col gap-[8px]">
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Description>
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/greenbudget/subaccounts.png"
          alt="GreenBudget Nested Accounts"
          caption={[
            "Users can view all of the products listed on the company's website and subscribe to " +
              "receive notifications for various events that may occur for a given product.",
          ]}
        />
      </ProjectImageWrapper>
    </Section>
    <Section title="Features" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Description>
      </div>
      <Section title="Sub-Totaling" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/grouping.gif"
            alt="GreenBudget Grouping"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Reordering" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/reordering.gif"
            alt="GreenBudget Reordering"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Intelligent Autocomplete" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/autocomplete.gif"
            alt="GreenBudget Autocomplete"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Attachments" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/attachments.gif"
            alt="GreenBudget Attachments"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Exporting" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/exporting.png"
            alt="GreenBudget Attachments"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/exporting-top-sheet.png"
            alt="GreenBudget Exporting"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Mobile" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/mobile-analysis.png"
            alt="GreenBudget Mobile"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
    </Section>
  </Project>
);

export default GreenBudget;

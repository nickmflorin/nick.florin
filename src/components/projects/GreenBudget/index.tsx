import { type ReactNode } from "react";

import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";

import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";
import { ProjectImageWrapper } from "../ProjectImageWrapper";
import { Section } from "../Section";

export interface GreenBudgetProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

const Emphasize = ({ children }: { children: ReactNode }): JSX.Element => (
  <span className="font-medium text-text">{children}</span>
);

export const GreenBudget = (props: GreenBudgetProps): JSX.Element => (
  <Project
    title={props.project.name}
    underConstruction
    disclaimer={
      <div className="flex flex-col gap-[8px]">
        <Description>
          Throughout the development of <Emphasize>GreenBudget</Emphasize>, I was working closely
          with a film producer in Los Angeles, CA. Unfortunately, after 2 years of working together,
          he decided to steal the software from me and relaunch it on servers that he had sole
          access to.
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
          <Emphasize>GreenBudget</Emphasize>&nbsp;to&nbsp;
          <Emphasize>HappyBudget</Emphasize>, to ensure that I was not incidentally infringing on a
          trademark. This is why you will sometimes see the project referred to as&nbsp;
          <Emphasize>HappyBudget</Emphasize>, but&nbsp;
          <Emphasize>GreenBudget</Emphasize>&nbsp;still remains as the legacy.
        </Description>
        <Description>
          The circumstances of this situation are still being worked out today. If you are
          interested in learning more, feel free to reach out to me directly.
        </Description>
      </div>
    }
    description={
      <div className="flex flex-col gap-[8px]">
        <Description>
          <Emphasize>GreenBudget</Emphasize> is an application that was created to address a niche
          market opportunity by providing a modern, web-based, multi-user collaborative budgeting
          solution for the film production industry. It replaced many outdated, inflexible and
          somewhat manual solutions that previously existed in the market.
        </Description>
        <Description>
          The application consists of an extensive&nbsp;
          <Link as="a" href="https://react.dev/">
            React
          </Link>
          &nbsp;frontend powered by a robust, REST API written using&nbsp;
          <Link as="a" href="https://www.djangoproject.com/">
            Django
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://www.django-rest-framework.org/">
            Django REST Framework
          </Link>
          &nbsp;. At the time in which I stopped working on the project, we were in the midst of
          transitioning the frontend to the popular&nbsp;
          <Link as="a" href="https://nextjs.org/">
            NextJS
          </Link>
          &nbsp;framework.
        </Description>
        <Description>
          The application relies on several different open-source tabling libraries interwoven with
          a large amount of internal, custom built tabling mechanics that are built primarily with
          the help of technology such as &nbsp;
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
          <Emphasize>GreenBudget</Emphasize>&nbsp;boasted a little over&nbsp;
          <i>2 thousand subscribed (paying) users</i>&nbsp;and had drawn interest from a number of
          enterprise clients who had expressed interest in adopting the platform for their own use.
        </Description>
      </div>
    }
    {...props}
  >
    <Section title="Background" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          The way that film producers manage budgets is different than how people in any other
          industry manages budgets - standard, general accounting/budgeting tools do not work. The
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
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/greenbudget/landing.png"
          alt="GreenBudget Landing Page"
          caption={
            <Description>
              <Emphasize>GreenBudget</Emphasize>&apos;s original landing/slash page.
            </Description>
          }
        />
      </ProjectImageWrapper>
    </Section>
    <Section title="Concepts" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          In production budgeting, the <Emphasize>Top Sheet</Emphasize> represents the top level
          line-items, or <Emphasize>Account</Emphasize>(s) in the budget. The estimated, actual and
          variance values for each <Emphasize>Account</Emphasize> are determined based on the
          accumulation of related values on each <Emphasize>Sub Account</Emphasize> it contains.
        </Description>
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/greenbudget/topsheet.png"
          alt="GreenBudget Top Sheet"
          caption={
            <Description>
              An example of a <Emphasize>Top Sheet</Emphasize> in <Emphasize>GreenBudget</Emphasize>
              .
            </Description>
          }
        />
      </ProjectImageWrapper>
      <div className="flex flex-col gap-[8px]">
        <Description>
          When an <Emphasize>Account</Emphasize> is &quot;expanded&quot;, the&nbsp;
          <Emphasize>Account</Emphasize>&nbsp; row expands into a new table showing all of the&nbsp;
          <Emphasize>Sub Account</Emphasize>(s) that it contains. The metrics for each row
          (i.e.&nbsp;
          <Emphasize>Sub Account</Emphasize>(s)) funnel upwards to the associated&nbsp;
          <Emphasize>Account</Emphasize> row in the&nbsp;
          <Emphasize>Top Sheet</Emphasize>.
        </Description>
      </div>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/greenbudget/subaccounts.png"
          alt="GreenBudget Nested Accounts"
          caption={
            <Description>
              An example of the expanded <Emphasize>Sub Account</Emphasize>(s) view for&nbsp;
              <Emphasize>Account 1001; Construction Contracts for Set</Emphasize>.
            </Description>
          }
        />
      </ProjectImageWrapper>
      <Section title="Infinitely Recursive Tree Structure" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            It&apos;s not just <Emphasize>Account</Emphasize>(s) that can expand. Any given&nbsp;
            <Emphasize>Sub Account</Emphasize> row at any level deep in the budget can expand as
            well. This results in a budget being represented as an infinitely recursive tree-like
            structure, where at each level of the tree, values continue to funnel upwards from
            parent to parent - all the way until the <Emphasize>Top Sheet</Emphasize> is reached.
          </Description>
          <Description>
            This infinitely recursive tree structure can lead to truly enormous data structures. For
            instance, it would not be uncommon for a budget to be structured such that the&nbsp;
            <Emphasize>Top Sheet</Emphasize> had 100 <Emphasize>Account</Emphasize>(s), where
            each&nbsp;
            <Emphasize>Account</Emphasize> had 50 <Emphasize>Sub Account</Emphasize>(s), and each of
            those <Emphasize>Sub Account</Emphasize>(s) had 50 <Emphasize>Sub Account</Emphasize>
            (s), and each of those <Emphasize>Sub Account</Emphasize>(s) has 20&nbsp;
            <Emphasize>Sub Account</Emphasize>(s). In this case, the budget would have 5 million
            rows of data.
          </Description>
          <Description>
            It is not difficult to see how this can quickly become a complex problem to solve,
            particularly as it relates to performance issues, loading the data for a given
            table&nbsp;
            <Emphasize>and</Emphasize> applying the appropriate changes to the parent table(s) when
            a given value in the child table is changed. Since each table had to be aware of the
            affect that changing a value in a row would have on its parent, and the&nbsp;
            <Emphasize>Top Sheet</Emphasize>, it is easy to gather how important it was to
            intelligently load data and apply updates in the most performant ways to prevent a given
            table view inside of the budget from taking a large amount of time to load, render or
            show updated values after a change occurred.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/expanding.gif"
            alt="GreenBudget Top Sheet"
            caption={
              <Description>
                An example of a user expanding 3 layers deep in a budget, to the second layer
                of&nbsp;
                <Emphasize>Sub Account</Emphasize>(s). Notice how the total values in the&nbsp;
                <Emphasize>Top Sheet</Emphasize> (shown at the bottom in the gray bar labeled
                &apos;Test Budget Total&apos;) update as the user pastes the copied content
                into&nbsp; the&nbsp;
                <Emphasize>Sub Account</Emphasize> view.
              </Description>
            }
          />
        </ProjectImageWrapper>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Luckily, I developed a solution for this problem - which allowed us to both load and
            render given views of the budget extremely quickly and apply updates that affected
            several layers of parent tables in a fraction of the time it would have taken to do so
            otherwise. If you are interested in learning more, please feel free to reach out to me
            directly.
          </Description>
        </div>
      </Section>
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
      <Section title="Actualization" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/actualization.gif"
            alt="GreenBudget Actualization"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Fringes" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/fringes.gif"
            alt="GreenBudget Fringes"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
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
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/grouping-from-checkboxes.gif"
            alt="GreenBudget Checkbox Grouping"
            caption={[
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
                "incididunt ut labore et dolore magna aliqua.",
            ]}
          />
        </ProjectImageWrapper>
      </Section>
      <Section title="Markup" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/markup.gif"
            alt="GreenBudget Markup"
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
      <Section title="Sharing" marginBottom={false} subSection>
        <div className="flex flex-col gap-[8px]">
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Description>
        </div>
        <ProjectImageWrapper className="mt-[8px]">
          <ProjectImage
            src="/projects/greenbudget/share-view.png"
            alt="GreenBudget Share View"
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

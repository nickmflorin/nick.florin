import { type ReactNode } from "react";

import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";

import { CaptionDescription } from "../CaptionDescription";
import { DescriptionGroup } from "../DescriptionGroup";
import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";
import { Section } from "../Section";

export interface GreenBudgetProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

const Emphasize = ({ children }: { children: ReactNode }): JSX.Element => (
  <span className="font-medium text-text">{children}</span>
);

const CaptionEmphasize = ({ children }: { children: ReactNode }): JSX.Element => (
  <span className="font-medium text-[#7f7f7f]">{children}</span>
);

export const GreenBudget = (props: GreenBudgetProps): JSX.Element => (
  <Project
    title={props.project.name}
    underConstruction
    disclaimer={
      <DescriptionGroup>
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
      </DescriptionGroup>
    }
    description={
      <DescriptionGroup>
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
      </DescriptionGroup>
    }
    {...props}
  >
    <Section title="Background" marginBottom={false}>
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
        src="/projects/greenbudget/landing.png"
        alt="GreenBudget Landing Page"
        caption={
          <CaptionDescription centered>
            <CaptionEmphasize>GreenBudget</CaptionEmphasize>&apos;s original landing/slash page.
          </CaptionDescription>
        }
      />
    </Section>
    <Section title="Concepts" marginBottom={false}>
      <Description>
        In production budgeting, the <Emphasize>Top Sheet</Emphasize> represents the top level line
        items, or <Emphasize>Account</Emphasize>(s) in the budget. The estimated, actual and
        variance values for each <Emphasize>Account</Emphasize> are determined based on the
        accumulation of related values on each <Emphasize>Sub Account</Emphasize> it contains.
      </Description>
      <ProjectImage
        src="/projects/greenbudget/topsheet.png"
        alt="GreenBudget Top Sheet"
        caption={
          <CaptionDescription centered>
            An example of a <CaptionEmphasize>Top Sheet</CaptionEmphasize> in&nbsp;
            <CaptionEmphasize>GreenBudget</CaptionEmphasize>.
          </CaptionDescription>
        }
      />
      <Description>
        When an <Emphasize>Account</Emphasize> is &quot;expanded&quot;, the&nbsp;
        <Emphasize>Account</Emphasize>&nbsp; row expands into a new table showing all of the&nbsp;
        <Emphasize>Sub Account</Emphasize>(s) that it contains. The metrics for each row (i.e.&nbsp;
        <Emphasize>Sub Account</Emphasize>(s)) funnel upwards to the associated&nbsp;
        <Emphasize>Account</Emphasize> row in the&nbsp;
        <Emphasize>Top Sheet</Emphasize>.
      </Description>
      <ProjectImage
        src="/projects/greenbudget/subaccounts.png"
        alt="GreenBudget Nested Accounts"
        caption={
          <CaptionDescription centered>
            An example of the expanded <CaptionEmphasize>Sub Account</CaptionEmphasize>(s) view
            for&nbsp;
            <CaptionEmphasize>Account 1001; Construction Contracts for Set</CaptionEmphasize>.
          </CaptionDescription>
        }
      />
      <Section title="Infinitely Recursive Tree Structure" marginBottom={false} subSection>
        <DescriptionGroup>
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
        </DescriptionGroup>
        <ProjectImage
          src="/projects/greenbudget/expanding.gif"
          alt="GreenBudget Top Sheet"
          caption={
            <CaptionDescription>
              An example of a user expanding 3 layers deep in a budget, to the second layer of&nbsp;
              <CaptionEmphasize>Sub Account</CaptionEmphasize>(s). Notice how the total values in
              the&nbsp;
              <CaptionEmphasize>Top Sheet</CaptionEmphasize> (shown at the bottom in the gray bar
              labeled &apos;Test Budget Total&apos;) update as the user pastes the copied content
              into&nbsp; the&nbsp;
              <CaptionEmphasize>Sub Account</CaptionEmphasize> view.
            </CaptionDescription>
          }
        />
        <Description>
          Luckily, I developed a solution for this problem - which allowed us to both load and
          render given views of the budget extremely quickly and apply updates that affected several
          layers of parent tables in a fraction of the time it would have taken to do so otherwise.
          If you are interested in learning more, please feel free to reach out to me directly.
        </Description>
      </Section>
    </Section>
    <Section title="Features" marginBottom={false}>
      <Description>
        Even when in its infancy, <Emphasize>GreenBudget</Emphasize> was packed with features that
        were not available in any other production budgeting tool on the market. It is impossible to
        describe each and every feature on this page - so the following represents a brief summary
        of just <i>some</i> of the features that were available.
      </Description>
      <Section title="Actualization" marginBottom={false} subSection>
        <DescriptionGroup>
          <Description>
            In film production, an <Emphasize>Actual</Emphasize> is a term that is used to describe
            the <i>actual</i>, realized cost of a given line item in a budget. Sometimes (more often
            than not) the actual cost of a given line item differs from the line item&spos;s
            original <Emphasize>estimated</Emphasize> value, and the difference is referred to as
            the&nbsp;
            <Emphasize>variance</Emphasize>.
          </Description>
          <Description>
            In a production budget, <Emphasize>Actual</Emphasize>(s) are stored in separate tables -
            and then tied to individual line items of the budget through foreign-key relationships.
            This allows other information to be stored alongside the <Emphasize>Actual</Emphasize>,
            such as attachments, notes, etc. It is often the case that a producer will want to keep
            a record of, for instance, the receipts that were used to justify the actual cost of a
            line item.
          </Description>
        </DescriptionGroup>
        <ProjectImage
          src="/projects/greenbudget/actualization.gif"
          alt="GreenBudget Actualization"
          caption={
            <CaptionDescription>
              An example of a user creating a new <CaptionEmphasize>Actual</CaptionEmphasize>,
              &nbsp;<CaptionEmphasize>1001-A-7</CaptionEmphasize>, and associating the&nbsp;
              <CaptionEmphasize>Actual</CaptionEmphasize>
              &nbsp; with the&nbsp;
              <CaptionEmphasize>Sub Account</CaptionEmphasize> for&nbsp;
              <CaptionEmphasize>Hotel Stay</CaptionEmphasize> costs in the budget.
            </CaptionDescription>
          }
        />
      </Section>
      <Section title="Fringes" marginBottom={false} subSection>
        <Description>
          A <Emphasize>Fringe</Emphasize> represents a percentage or flat rate markup that can be
          applied to individual line items in a production budget. <Emphasize>Fringe</Emphasize>
          (s) are often reused across multiple line items in a table and across multiple tables in a
          budget. A <Emphasize>Fringe</Emphasize> will affect the&nbsp;
          <Emphasize>estimated</Emphasize> value of any line item it is applied to (assuming it has
          a non-zero percentage or flat rate value).
        </Description>
        <ProjectImage
          src="/projects/greenbudget/fringes.gif"
          alt="GreenBudget Fringes"
          caption={[
            <CaptionDescription key="0">
              An example of a user creating a new <CaptionEmphasize>Fringe</CaptionEmphasize>,
              &nbsp;<CaptionEmphasize>Fringe I</CaptionEmphasize>, and associating the&nbsp;
              <CaptionEmphasize>Fringe</CaptionEmphasize>
              &nbsp; with the&nbsp;
              <CaptionEmphasize>Sub Account</CaptionEmphasize> for&nbsp;
              <CaptionEmphasize>Accountants</CaptionEmphasize> in the budget.
            </CaptionDescription>,
            <CaptionDescription key="1">
              The <CaptionEmphasize>Fringe</CaptionEmphasize> has a percentage rate of 25%, and a
              cutoff of $1000.00. This means that it will apply a 25% markup to the first $1000.00
              of the&nbsp;
              <CaptionEmphasize>Sub Account</CaptionEmphasize>&apos;s&nbsp;
              <CaptionEmphasize>estimated</CaptionEmphasize> value. You can see the&nbsp;
              <CaptionEmphasize>estimated</CaptionEmphasize> value of the&nbsp;
              <CaptionEmphasize>Sub Account</CaptionEmphasize>&nbsp; change from $11,250.00 to
              $11,500.00 immediately after the&nbsp;
              <CaptionEmphasize>Fringe</CaptionEmphasize> is applied in the above image.
            </CaptionDescription>,
          ]}
        />
      </Section>
      <Section title="Sub-Totaling" marginBottom={false} subSection>
        <DescriptionGroup>
          <Description>
            The Sub-Totaling feature can be used to summarize metrics for a&nbsp;
            <Emphasize>Group</Emphasize> of line items belonging to any table inside of the budget.
            Each <Emphasize>Group</Emphasize>, which is represented by a single, colored-configured
            row in the table, includes all line items above the <Emphasize>Group</Emphasize> row up
            until either the top of the table is reached or another <Emphasize>Group</Emphasize> row
            is encountered.
          </Description>
          <Description>
            As such, the contents inside of each <Emphasize>Group</Emphasize> depend on the ordering
            of the rows in the table. This means that reordering rows can affect the contents of any
            given&nbsp;
            <Emphasize>Group</Emphasize> in the table. For example, moving a row down in the table
            may cause it to be removed from one <Emphasize>Group</Emphasize> towards the top of the
            table and added to another <Emphasize>Group</Emphasize> below it. Additionally, both
            adding a new <Emphasize>Group</Emphasize> in the middle of the table and/or removing
            a&nbsp;
            <Emphasize>Group</Emphasize> from the table in general can cause the rows of the table
            to be automatically reordered based on the new <Emphasize>Group</Emphasize> structure.
          </Description>
          <Description>
            With this in mind, it is clear that the ability to reorder rows in the table in
            conjunction with the ability to group rows in the table introduced a rather complicated
            problem that had to be solved in order to support both features in tandem.
          </Description>
        </DescriptionGroup>
        <ProjectImage
          src="/projects/greenbudget/grouping.gif"
          alt="GreenBudget Grouping"
          caption={[
            <CaptionDescription key="0">
              An example of a user creating a new <CaptionEmphasize>Group</CaptionEmphasize> from
              the 3 highlighted rows in the table. The rows in the newly created&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize>, which had previously belonged to the&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> named&nbsp;
              <CaptionEmphasize>Miscellaneous</CaptionEmphasize>, were removed from that&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> while being added to the new&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> simultaneously.
            </CaptionDescription>,
            <CaptionDescription key="1">
              You can see this transition occur by focusing on the summarized, calculated values
              associated with both the&nbsp;
              <CaptionEmphasize>Miscellaneous</CaptionEmphasize>
              <CaptionEmphasize>Group</CaptionEmphasize> and the newly created&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> in the above image. When the new&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> is created, the summarized values of
              the&nbsp;
              <CaptionEmphasize>Miscellaneous</CaptionEmphasize>&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize>&nbsp; decrease by the same amount that the
              summarized values of the new&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> total to.
            </CaptionDescription>,
          ]}
        />
        <Description>
          <Emphasize>Group</Emphasize>(s) can also be created by selecting (checking) individual
          rows in the table.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/grouping-from-checkboxes.gif"
          alt="GreenBudget Checkbox Grouping"
          caption={
            <CaptionDescription centered>
              An example of a user creating a new <CaptionEmphasize>Group</CaptionEmphasize> from
              the 3 checked rows in the table.
            </CaptionDescription>
          }
        />
        <Description>
          Rows of the table can be removed from the <Emphasize>Group</Emphasize> they belong to by
          either dragging the row out of the <Emphasize>Group</Emphasize> or by right-clicking the
          row and selecting the &quot;Remove from Group&quot; option in the context menu.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/removing-from-group.gif"
          alt="GreenBudget Removing From Group"
          caption={
            <CaptionDescription>
              An example of a user removing a row from the&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize> it belongs to. The row is moves to the
              bottom of the table, underneath the last&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize>, because it no longer belongs to any&nbsp;
              <CaptionEmphasize>Group</CaptionEmphasize>&nbsp; in the table.
            </CaptionDescription>
          }
        />
      </Section>
      <Section title="Reordering" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/reordering.gif"
          alt="GreenBudget Reordering"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
      <Section title="Markup" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/markup.gif"
          alt="GreenBudget Markup"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
      <Section title="Intelligent Autocomplete" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/autocomplete.gif"
          alt="GreenBudget Autocomplete"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
      <Section title="Attachments" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/attachments.gif"
          alt="GreenBudget Attachments"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
      <Section title="Exporting" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/exporting.png"
          alt="GreenBudget Attachments"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
        <ProjectImage
          src="/projects/greenbudget/exporting-top-sheet.png"
          alt="GreenBudget Exporting"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
      <Section title="Sharing" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/share-view.png"
          alt="GreenBudget Share View"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
      <Section title="Mobile" marginBottom={false} subSection>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/mobile-analysis.png"
          alt="GreenBudget Mobile"
          caption={[
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
              "incididunt ut labore et dolore magna aliqua.",
          ]}
        />
      </Section>
    </Section>
  </Project>
);

export default GreenBudget;

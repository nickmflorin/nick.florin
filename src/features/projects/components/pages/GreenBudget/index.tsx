"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { InlineLink } from "~/components/buttons";
import { ShowMoreLink } from "~/components/buttons/ShowMoreLink";
import { type TypographyVisibilityState } from "~/components/types";
import { Description } from "~/components/typography";
import { CaptionDescription } from "~/features/projects/components/CaptionDescription";
import { DescriptionGroup } from "~/features/projects/components/DescriptionGroup";
import { Emphasize } from "~/features/projects/components/Emphasize";
import { Project, type ProjectProps } from "~/features/projects/components/Project";
import { ProjectImage } from "~/features/projects/components/ProjectImage";
import { Section } from "~/features/projects/components/Section";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const MotionDescriptionGroup = motion(DescriptionGroup);

const DisclaimerIntro = () => (
  <Description>
    Throughout the development of <Emphasize>GreenBudget</Emphasize>, I was working closely with a
    film producer in Los Angeles, CA. Unfortunately, after 2 years of working together, he decided
    to steal the software from me and relaunch it on servers that he had sole access to.
  </Description>
);

const DisclaimerContent = () => (
  <>
    <Description>
      After approximately 8 months of GreenBudget running on these new servers, he was forced to
      shut the servers down. However, a few months later, GreenBudget had been rebranded and
      expanded upon, and was subsequently launched under what is now called&nbsp;
      <InlineLink element="a" href="https://saturation.io/">
        Saturation IO
      </InlineLink>
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
      The circumstances of this situation are still being worked out today. If you are interested in
      learning more, feel free to reach out to me directly.
    </Description>
  </>
);

export interface GreenBudgetProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const GreenBudget = (props: GreenBudgetProps): JSX.Element => {
  const [disclaimerState, setDisclaimerState] = useState<TypographyVisibilityState>("collapsed");
  const { isLessThanOrEqualTo } = useScreenSizes();

  return (
    <Project
      title={props.project.name}
      underConstruction
      disclaimer={
        isLessThanOrEqualTo("sm") ? (
          <div className="flex flex-col gap-[4px]">
            <DescriptionGroup>
              <DisclaimerIntro />
              <AnimatePresence>
                {disclaimerState === "expanded" && (
                  <MotionDescriptionGroup
                    initial={{ opacity: 0, height: 0 }}
                    animate={
                      disclaimerState === "expanded"
                        ? { opacity: 1, height: "auto" }
                        : { opacity: 0, height: 0 }
                    }
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <DisclaimerContent />
                  </MotionDescriptionGroup>
                )}
              </AnimatePresence>
            </DescriptionGroup>
            <ShowMoreLink
              state={disclaimerState}
              onClick={() =>
                setDisclaimerState(curr => (curr === "collapsed" ? "expanded" : "collapsed"))
              }
            />
          </div>
        ) : (
          <DescriptionGroup>
            <DisclaimerIntro />
            <DisclaimerContent />
          </DescriptionGroup>
        )
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
            <InlineLink element="a" href="https://react.dev/">
              React
            </InlineLink>
            &nbsp;frontend powered by a robust, REST API written using&nbsp;
            <InlineLink element="a" href="https://www.djangoproject.com/">
              Django
            </InlineLink>
            &nbsp;and&nbsp;
            <InlineLink element="a" href="https://www.django-rest-framework.org/">
              Django REST Framework
            </InlineLink>
            &nbsp;. At the time in which I stopped working on the project, we were in the midst of
            transitioning the frontend to the popular&nbsp;
            <InlineLink element="a" href="https://nextjs.org/">
              NextJS
            </InlineLink>
            &nbsp;framework.
          </Description>
          <Description>
            The application relies on several different open-source tabling libraries interwoven
            with a large amount of internal, custom built tabling mechanics that are built primarily
            with the help of technology such as &nbsp;
            <InlineLink element="a" href="https://react-redux.js.org/">
              React Redux
            </InlineLink>
            &nbsp;and&nbsp;
            <InlineLink element="a" href="https://redux-saga.js.org/">
              Redux Sagas
            </InlineLink>
            .
          </Description>
          <Description>
            By the time I stopped working on the project,&nbsp;
            <Emphasize>GreenBudget</Emphasize>&nbsp;boasted a little over&nbsp;
            <i>2 thousand subscribed (paying) users</i>&nbsp;and had drawn interest from a number of
            enterprise clients who had expressed interest in adopting the platform for their own
            use.
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
            majority of (if not all) producers relied on a combination of internal,
            overly-complicated spreadsheets with custom macros, third-party Excel integrations
            and/or the popular MovieMagic budgeting software - which is a desktop-only, single
            tenant, expensive and severely outdated piece of software.
          </Description>
          <Description>
            When I was approached by a film producer out in Los Angeles, CA with an idea to
            modernize film budgeting with a web-based, mult-user, collaborative solution tailored
            specifically towards film production, I thought it was a great idea - and we began
            working together on what would eventually become <Emphasize>GreenBudget</Emphasize>.
          </Description>
        </DescriptionGroup>
        <ProjectImage
          src="/projects/greenbudget/landing.png"
          alt="GreenBudget Landing Page"
          caption={
            <CaptionDescription centered>
              <Emphasize.Caption>GreenBudget</Emphasize.Caption>&apos;s original landing/slash page.
            </CaptionDescription>
          }
        />
      </Section>
      <Section title="Concepts" marginBottom={false}>
        <Description>
          In production budgeting, the <Emphasize>Top Sheet</Emphasize> represents the top level
          line items, or <Emphasize>Account</Emphasize>(s) in the budget. The estimated, actual and
          variance values for each <Emphasize>Account</Emphasize> are determined based on the
          accumulation of related values on each <Emphasize>Sub Account</Emphasize> it contains.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/topsheet.png"
          alt="GreenBudget Top Sheet"
          caption={
            <CaptionDescription centered>
              An example of a <Emphasize.Caption>Top Sheet</Emphasize.Caption> in&nbsp;
              <Emphasize.Caption>GreenBudget</Emphasize.Caption>.
            </CaptionDescription>
          }
        />
        <Description>
          When an <Emphasize>Account</Emphasize> is &quot;expanded&quot;, the&nbsp;
          <Emphasize>Account</Emphasize>&nbsp;row expands into a new table showing all of the&nbsp;
          <Emphasize>Sub Account</Emphasize>(s) that it contains. The metrics for each row
          (i.e.&nbsp;
          <Emphasize>Sub Account</Emphasize>(s)) funnel upwards to the associated&nbsp;
          <Emphasize>Account</Emphasize> row in the&nbsp;
          <Emphasize>Top Sheet</Emphasize>.
        </Description>
        <ProjectImage
          src="/projects/greenbudget/subaccounts.png"
          alt="GreenBudget Nested Accounts"
          caption={
            <CaptionDescription centered>
              An example of the expanded <Emphasize.Caption>Sub Account</Emphasize.Caption>(s) view
              for&nbsp;
              <Emphasize.Caption>Account 1001; Construction Contracts for Set</Emphasize.Caption>.
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
              This infinitely recursive tree structure can lead to truly enormous data structures.
              For instance, it would not be uncommon for a budget to be structured such that
              the&nbsp;
              <Emphasize>Top Sheet</Emphasize> had 100 <Emphasize>Account</Emphasize>(s), where
              each&nbsp;
              <Emphasize>Account</Emphasize> had 50 <Emphasize>Sub Account</Emphasize>(s), and each
              of those <Emphasize>Sub Account</Emphasize>(s) had 50{" "}
              <Emphasize>Sub Account</Emphasize>
              (s), and each of those <Emphasize>Sub Account</Emphasize>(s) has 20&nbsp;
              <Emphasize>Sub Account</Emphasize>(s). In this case, the budget would have 5 million
              rows of data.
            </Description>
            <Description>
              It is not difficult to see how this can quickly become a complex problem to solve,
              particularly as it relates to performance issues, loading the data for a given
              table&nbsp;
              <Emphasize>and</Emphasize> applying the appropriate changes to the parent table(s)
              when a given value in the child table is changed. Since each table had to be aware of
              the affect that changing a value in a row would have on its parent, and the&nbsp;
              <Emphasize>Top Sheet</Emphasize>, it is easy to gather how important it was to
              intelligently load data and apply updates in the most performant ways to prevent a
              given table view inside of the budget from taking a large amount of time to load,
              render or show updated values after a change occurred.
            </Description>
          </DescriptionGroup>
          <ProjectImage
            src="/projects/greenbudget/expanding.gif"
            alt="GreenBudget Top Sheet"
            caption={
              <CaptionDescription>
                An example of a user expanding 3 layers deep in a budget, to the second layer
                of&nbsp;
                <Emphasize.Caption>Sub Account</Emphasize.Caption>(s). Notice how the total values
                in the&nbsp;
                <Emphasize.Caption>Top Sheet</Emphasize.Caption> (shown at the bottom in the gray
                bar labeled &apos;Test Budget Total&apos;) update as the user pastes the copied
                content into the&nbsp;
                <Emphasize.Caption>Sub Account</Emphasize.Caption> view.
              </CaptionDescription>
            }
          />
          <Description>
            Luckily, I developed a solution for this problem - which allowed us to both load and
            render given views of the budget extremely quickly and apply updates that affected
            several layers of parent tables in a fraction of the time it would have taken to do so
            otherwise. If you are interested in learning more, please feel free to reach out to me
            directly.
          </Description>
        </Section>
      </Section>
      <Section title="Features" marginBottom={false}>
        <Description>
          Even when in its infancy, <Emphasize>GreenBudget</Emphasize> was packed with features that
          were not available in any other production budgeting tool on the market. It is impossible
          to describe each and every feature on this page - so the following represents a brief
          summary of just <i>some</i> of the features that were available.
        </Description>
        <Section title="Actualization" marginBottom={false} subSection>
          <DescriptionGroup>
            <Description>
              In film production, an <Emphasize>Actual</Emphasize> is a term that is used to
              describe the <i>actual</i>, realized cost of a given line item in a budget. Sometimes
              (more often than not) the actual cost of a given line item differs from the line
              item&spos;s original <Emphasize>estimated</Emphasize> value, and the difference is
              referred to as the&nbsp;
              <Emphasize>variance</Emphasize>.
            </Description>
            <Description>
              In a production budget, <Emphasize>Actual</Emphasize>(s) are stored in separate tables
              - and then tied to individual line items of the budget through foreign-key
              relationships. This allows other information to be stored alongside the{" "}
              <Emphasize>Actual</Emphasize>, such as attachments, notes, etc. It is often the case
              that a producer will want to keep a record of, for instance, the receipts that were
              used to justify the actual cost of a line item.
            </Description>
          </DescriptionGroup>
          <ProjectImage
            src="/projects/greenbudget/actualization.gif"
            alt="GreenBudget Actualization"
            caption={
              <CaptionDescription>
                An example of a user creating a new <Emphasize.Caption>Actual</Emphasize.Caption>,
                &nbsp;<Emphasize.Caption>1001-A-7</Emphasize.Caption>, and associating the&nbsp;
                <Emphasize.Caption>Actual</Emphasize.Caption>
                &nbsp;with the&nbsp;
                <Emphasize.Caption>Sub Account</Emphasize.Caption> for&nbsp;
                <Emphasize.Caption>Hotel Stay</Emphasize.Caption> costs in the budget.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Fringes" marginBottom={false} subSection>
          <Description>
            A <Emphasize>Fringe</Emphasize> represents a percentage or flat rate markup that can be
            applied to individual line items in a production budget. <Emphasize>Fringe</Emphasize>
            (s) are often reused across multiple line items in a table and across multiple tables in
            a budget. A <Emphasize>Fringe</Emphasize> will affect the&nbsp;
            <Emphasize>estimated</Emphasize> value of any line item it is applied to (assuming it
            has a non-zero percentage or flat rate value).
          </Description>
          <ProjectImage
            src="/projects/greenbudget/fringes.gif"
            alt="GreenBudget Fringes"
            caption={[
              <CaptionDescription key="0">
                An example of a user creating a new <Emphasize.Caption>Fringe</Emphasize.Caption>,
                &nbsp;<Emphasize.Caption>Fringe I</Emphasize.Caption>, and associating the&nbsp;
                <Emphasize.Caption>Fringe</Emphasize.Caption>
                &nbsp;with the&nbsp;
                <Emphasize.Caption>Sub Account</Emphasize.Caption> for&nbsp;
                <Emphasize.Caption>Accountants</Emphasize.Caption> in the budget.
              </CaptionDescription>,
              <CaptionDescription key="1">
                The <Emphasize.Caption>Fringe</Emphasize.Caption> has a percentage rate of 25%, and
                a cutoff of $1000.00. This means that it will apply a 25% markup to the first
                $1000.00 of the&nbsp;
                <Emphasize.Caption>Sub Account</Emphasize.Caption>&apos;s&nbsp;
                <Emphasize.Caption>estimated</Emphasize.Caption> value. You can see the&nbsp;
                <Emphasize.Caption>estimated</Emphasize.Caption> value of the&nbsp;
                <Emphasize.Caption>Sub Account</Emphasize.Caption>&nbsp;change from $11,250.00 to
                $11,500.00 immediately after the&nbsp;
                <Emphasize.Caption>Fringe</Emphasize.Caption> is applied in the above image.
              </CaptionDescription>,
            ]}
          />
        </Section>
        <Section title="Sub-Totaling" marginBottom={false} subSection>
          <DescriptionGroup>
            <Description>
              The Sub-Totaling feature can be used to summarize metrics for a&nbsp;
              <Emphasize>Group</Emphasize> of line items belonging to any table inside of the
              budget. Each <Emphasize>Group</Emphasize>, which is represented by a single,
              colored-configured row in the table, includes all line items above the{" "}
              <Emphasize>Group</Emphasize> row up until either the top of the table is reached or
              another <Emphasize>Group</Emphasize> row is encountered.
            </Description>
            <Description>
              As such, the contents inside of each <Emphasize>Group</Emphasize> depend on the
              ordering of the rows in the table. This means that reordering rows can affect the
              contents of any given&nbsp;
              <Emphasize>Group</Emphasize> in the table. For example, moving a row down in the table
              may cause it to be removed from one <Emphasize>Group</Emphasize> towards the top of
              the table and added to another <Emphasize>Group</Emphasize> below it. Additionally,
              both adding a new <Emphasize>Group</Emphasize> in the middle of the table and/or
              removing a&nbsp;
              <Emphasize>Group</Emphasize> from the table in general can cause the rows of the table
              to be automatically reordered based on the new <Emphasize>Group</Emphasize> structure.
            </Description>
            <Description>
              With this in mind, it is clear that the ability to reorder rows in the table in
              conjunction with the ability to group rows in the table introduced a rather
              complicated problem that had to be solved in order to support both features in tandem.
            </Description>
          </DescriptionGroup>
          <ProjectImage
            src="/projects/greenbudget/grouping.gif"
            alt="GreenBudget Grouping"
            caption={[
              <CaptionDescription key="0">
                An example of a user creating a new <Emphasize.Caption>Group</Emphasize.Caption>
                &nbsp;from the 3 highlighted rows in the table. The rows in the newly created&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption>, which had previously belonged to
                the&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption> named&nbsp;
                <Emphasize.Caption>Miscellaneous</Emphasize.Caption>, were removed from that&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption> while being added to the new&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption> simultaneously.
              </CaptionDescription>,
              <CaptionDescription key="1">
                You can see this transition occur by focusing on the summarized, calculated values
                associated with both the&nbsp;
                <Emphasize.Caption>Miscellaneous</Emphasize.Caption>
                <Emphasize.Caption>Group</Emphasize.Caption> and the newly created&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption> in the above image. When the new&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption> is created, the summarized values of
                the&nbsp;
                <Emphasize.Caption>Miscellaneous</Emphasize.Caption>&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption>&nbsp;decrease by the same amount that
                the summarized values of the new&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption> total to.
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
                An example of a user creating a new <Emphasize.Caption>Group</Emphasize.Caption>
                &nbsp;from the 3 checked rows in the table.
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
                <Emphasize.Caption>Group</Emphasize.Caption> it belongs to. The row is moves to the
                bottom of the table, underneath the last&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption>, because it no longer belongs to
                any&nbsp;
                <Emphasize.Caption>Group</Emphasize.Caption>&nbsp;in the table.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Reordering" marginBottom={false} subSection>
          <DescriptionGroup>
            <Description>
              In <Emphasize>GreenBudget</Emphasize>, a user was allowed to reorder the rows on a
              given table view inside of the budget and it would automatically persist.
            </Description>
            <Description>
              This was a feature that was rather complicated to implement from a performance point
              of view because when a row is reordered, we needed to ensure that just that row is
              updated in the database (and not every row after it as well). To accomplish this, we
              had to develop a&nbsp;
              <InlineLink
                openInNewTab
                element="a"
                href="https://github.com/nickmflorin/happybudget-api/blob/develop/src/happybudget/app/tabling/utils.py"
              >
                lexographical sorting algorithm
              </InlineLink>
              &nbsp;that would allow us to perform a reorder by just performing one database write,
              instead of updating potentially all the rows in the table.
            </Description>
            <Description>
              The other reason that this feature was difficult to implement was that the ordering of
              rows in a table inside of a production budget <i>means something</i>, in terms of
              how&nbsp;
              <Emphasize>Markup</Emphasize>(s) are applied and how <Emphasize>Group</Emphasize>(s)
              are determined, among other things.
            </Description>
          </DescriptionGroup>
          <ProjectImage
            src="/projects/greenbudget/reordering.gif"
            alt="GreenBudget Reordering"
            caption={
              <CaptionDescription>
                An example of a user moving a row in a given table view inside of a&nbsp;
                <Emphasize.Caption>GreenBudget</Emphasize.Caption> budget. Moving the row to a new
                location affects the <Emphasize.Caption>Group</Emphasize.Caption> structure of the
                view - which is why you observe the calculations for the two&nbsp;
                <Emphasize.Caption>Groups</Emphasize.Caption> in the table view changing after the
                row is moved.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Markup" marginBottom={false} subSection>
          <DescriptionGroup>
            <Description>
              The <Emphasize>Markup</Emphasize> feature can be used to apply percentage or flat rate
              markups to certain rows in a table view. <Emphasize>Markup</Emphasize>(s) - which are
              treated as separate <Emphasize>Sub Account</Emphasize>(s) in the table, just without
              all the characteristics of a traditional <Emphasize>Sub Account</Emphasize> - appear
              as rows in the table with special indicators that aid users in differentiating them
              from other, non-<Emphasize>Markup</Emphasize> rows.
            </Description>
            <Description>
              Since <Emphasize>Markup</Emphasize>(s) are treated as a pseudo-
              <Emphasize>Sub Account</Emphasize>, they contribute to the overall values of the
              parent table.
            </Description>
            <Description>
              <Emphasize>Markup</Emphasize>(s) can be applied to rows in the table in a variety of
              different ways, including checkbox selection of rows and highlighting certain portions
              of the table.
            </Description>
          </DescriptionGroup>
          <ProjectImage
            src="/projects/greenbudget/markup.gif"
            alt="GreenBudget Markup"
            caption={
              <CaptionDescription>
                An example of a user creating a <Emphasize.Caption>Markup</Emphasize.Caption> and
                applying it to the selected rows in the table. The&nbsp;
                <Emphasize.Caption>Markup</Emphasize.Caption> applies a 15% multiplier to the first
                4 rows of the table, contributing (roughly) an additional ~$800,000.00 to the
                estimated value of the table&apos;s parent.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Intelligent Autocomplete" marginBottom={false} subSection>
          <Description>
            <Emphasize>Greenbudget</Emphasize> incorporated an intelligent system of deterministic
            algorithms for making education guesses about what the values of newly created rows
            might be based on patterns that it detects in previously created rows.
          </Description>
          <ProjectImage
            src="/projects/greenbudget/autocomplete.gif"
            alt="GreenBudget Autocomplete"
            caption={
              <CaptionDescription>
                An example of <Emphasize.Caption>Greenbudget</Emphasize.Caption>&spos;s autocomplete
                algorithms at work. When the user double-clicks&nbsp;
                <Emphasize.Caption>Enter</Emphasize.Caption> while at the bottom of the table,&nbsp;
                <Emphasize.Caption>Greenbudget</Emphasize.Caption> automatically creates a new row
                and makes education guesses as to what certain values in the new row should be.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Attachments" marginBottom={false} subSection>
          <Description>
            <Emphasize>Greenbudget</Emphasize> allowed users to upload files and associate those
            files with individual rows of both the budget and the actuals tables. This was a very
            popular feature, as it allowed users to keep a record of receipts, invoices and
            contracts directly in the budget itself.
          </Description>
          <ProjectImage
            src="/projects/greenbudget/attachments.gif"
            alt="GreenBudget Attachments"
            caption={
              <DescriptionGroup>
                <CaptionDescription>
                  An example of user uploading an attachment for a row in the &nbsp;
                  <Emphasize>Sub Account</Emphasize>(s) table view inside of a budget.
                </CaptionDescription>
                <CaptionDescription>
                  Just like all other cells, attachment cells could be copy/pasted and copied over a
                  range of cells with a simple drag and drop.
                </CaptionDescription>
              </DescriptionGroup>
            }
          />
        </Section>
        <Section title="Exporting" marginBottom={false} subSection>
          <Description>
            <Emphasize>Greenbudget</Emphasize> supported comprehensive export features, which
            allowed a user to export a budget in the application in a variety of different forms.
            The most valued export feature was the ability to export a budget, or portions of a
            budget, as a customizable PDF document.
          </Description>
          <ProjectImage
            src="/projects/greenbudget/exporting.png"
            alt="GreenBudget Exports"
            caption={
              <DescriptionGroup>
                <CaptionDescription>
                  An example of user exporting a PDF budget in&nbsp;
                  <Emphasize.Caption>Greenbudget</Emphasize.Caption>. The PDF document allowed for
                  flexible customization, including the ability to add cover images, custom headers,
                  and selectively choose which portions of the budget to include in the export.
                </CaptionDescription>
                <CaptionDescription>
                  The export feature included a &apos;Live Preview&apos; sub-feature, which allowed
                  the user to see what the exported PDF would like like before it was actually
                  exported.
                </CaptionDescription>
              </DescriptionGroup>
            }
          />
          <ProjectImage
            src="/projects/greenbudget/exporting-top-sheet.png"
            alt="GreenBudget Exporting"
            caption={
              <CaptionDescription>
                An example of the &apos;Live Preview&apos; feature showing the user what the
                budget&apos; <Emphasize.Caption>Top Sheet</Emphasize.Caption> would look like when
                the budget is exported.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Sharing" marginBottom={false} subSection>
          <Description>
            While <Emphasize>Greenbudget</Emphasize> supported access control policies and
            multi-user collaboration on budgets, it also included the ability to create read-only
            versions of a budget that could be shared with a shareable link.
          </Description>
          <ProjectImage
            src="/projects/greenbudget/share-view.png"
            alt="GreenBudget Share View"
            caption={
              <CaptionDescription>
                An example of a user creating a private, shareable link for the budget. When other
                users (who have been given the link) visit it, they are presented with a read-only
                version of the budget, with certain data hidden in a configurable fashion.
              </CaptionDescription>
            }
          />
        </Section>
        <Section title="Mobile" marginBottom={false} subSection>
          <Description>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
};

export default GreenBudget;

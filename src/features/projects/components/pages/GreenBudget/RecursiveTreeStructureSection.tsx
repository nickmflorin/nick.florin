import { Description } from '~/components/typography';
import { CaptionDescription } from '~/features/projects/components/CaptionDescription';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { ProjectVideo } from '~/features/projects/components/ProjectVideo';
import { Section } from '~/features/projects/components/Section';

export const RecursiveTreeStructureSection = () => (
  <Section hasMarginBottom={false} isSubSection title='Infinitely Recursive Tree Structure'>
    <DescriptionGroup>
      <Description>
        <Emphasize>Accounts</Emphasize> are not the only rows that can expand. Any{' '}
        <Emphasize>Sub Account</Emphasize> row, at any depth in the budget, can expand as well. A
        budget is therefore an infinitely recursive tree, where the values at every level funnel
        upwards from parent to parent until they reach the <Emphasize>Top Sheet</Emphasize>.
      </Description>
      <Description>
        A tree like that can hold an enormous amount of data. It would not be uncommon for a{' '}
        <Emphasize>Top Sheet</Emphasize> to have 100 <Emphasize>Accounts</Emphasize>, each with 50{' '}
        <Emphasize>Sub Accounts</Emphasize>, each of those with 50 more, and each of those with
        another 20. That budget would contain 5 million rows of data.
      </Description>
      <Description>
        Working with data of that shape quickly becomes a difficult problem, both when loading the
        data for a given table and when propagating a change in a child table up through its
        parents. Every table has to know how a changed value affects its parents and, ultimately,
        the <Emphasize>Top Sheet</Emphasize>, so it was critical to load data and apply updates
        intelligently enough that no view of the budget took a long time to load, render or reflect
        a change.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          A user expanding three layers deep into a budget, down to the second layer of{' '}
          <Emphasize.Caption>Sub Accounts</Emphasize.Caption>. Notice how the totals in the{' '}
          <Emphasize.Caption>Top Sheet</Emphasize.Caption> (the gray bar at the bottom labeled
          &apos;Test Budget Total&apos;) update as the user pastes the copied content into the{' '}
          <Emphasize.Caption>Sub Account</Emphasize.Caption> view.
        </CaptionDescription>
      }
      label='A user expanding three layers deep into a GreenBudget budget'
      src='/projects/greenbudget/expanding'
    />
    <Description>
      I eventually developed a solution that let us load and render any view of the budget very
      quickly, and apply updates spanning several layers of parent tables in a fraction of the time
      it would otherwise have taken. If you are interested in hearing more about it, feel free to
      reach out to me directly.
    </Description>
  </Section>
);

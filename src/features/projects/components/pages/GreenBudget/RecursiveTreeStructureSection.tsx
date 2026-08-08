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
        It&apos;s not just <Emphasize>Account</Emphasize>(s) that can expand. Any given&nbsp;
        <Emphasize>Sub Account</Emphasize> row at any level deep in the budget can expand as well.
        This results in a budget being represented as an infinitely recursive tree-like structure,
        where at each level of the tree, values continue to funnel upwards from parent to parent -
        all the way until the <Emphasize>Top Sheet</Emphasize> is reached.
      </Description>
      <Description>
        This infinitely recursive tree structure can lead to truly enormous data structures. For
        instance, it would not be uncommon for a budget to be structured such that the&nbsp;
        <Emphasize>Top Sheet</Emphasize> had 100 <Emphasize>Account</Emphasize>(s), where each&nbsp;
        <Emphasize>Account</Emphasize> had 50 <Emphasize>Sub Account</Emphasize>(s), and each of
        those <Emphasize>Sub Account</Emphasize>(s) had 50 <Emphasize>Sub Account</Emphasize>
        (s), and each of those <Emphasize>Sub Account</Emphasize>(s) has 20&nbsp;
        <Emphasize>Sub Account</Emphasize>(s). In this case, the budget would have 5 million rows of
        data.
      </Description>
      <Description>
        It is not difficult to see how this can quickly become a complex problem to solve,
        particularly as it relates to performance issues, loading the data for a given table&nbsp;
        <Emphasize>and</Emphasize> applying the appropriate changes to the parent table(s) when a
        given value in the child table is changed. Since each table had to be aware of the affect
        that changing a value in a row would have on its parent, and the&nbsp;
        <Emphasize>Top Sheet</Emphasize>, it is easy to gather how important it was to intelligently
        load data and apply updates in the most performant ways to prevent a given table view inside
        of the budget from taking a large amount of time to load, render or show updated values
        after a change occurred.
      </Description>
    </DescriptionGroup>
    <ProjectVideo
      caption={
        <CaptionDescription>
          An example of a user expanding 3 layers deep in a budget, to the second layer of&nbsp;
          <Emphasize.Caption>Sub Account</Emphasize.Caption>(s). Notice how the total values in
          the&nbsp;
          <Emphasize.Caption>Top Sheet</Emphasize.Caption> (shown at the bottom in the gray bar
          labeled &apos;Test Budget Total&apos;) update as the user pastes the copied content into
          the&nbsp;
          <Emphasize.Caption>Sub Account</Emphasize.Caption> view.
        </CaptionDescription>
      }
      label='A user expanding three layers deep into a GreenBudget budget'
      src='/projects/greenbudget/expanding'
    />
    <Description>
      Luckily, I developed a solution for this problem - which allowed us to both load and render
      given views of the budget extremely quickly and apply updates that affected several layers of
      parent tables in a fraction of the time it would have taken to do so otherwise. If you are
      interested in learning more, please feel free to reach out to me directly.
    </Description>
  </Section>
);

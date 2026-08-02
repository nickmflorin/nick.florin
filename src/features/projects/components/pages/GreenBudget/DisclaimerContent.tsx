import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { Emphasize } from '~/features/projects/components/Emphasize';

export const DisclaimerContent = () => (
  <>
    <Description>
      After approximately 8 months of GreenBudget running on these new servers, he was forced to
      shut the servers down. However, a few months later, GreenBudget had been rebranded and
      expanded upon, and was subsequently launched under what is now called&nbsp;
      <InlineLink element='a' href='https://saturation.io/'>
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

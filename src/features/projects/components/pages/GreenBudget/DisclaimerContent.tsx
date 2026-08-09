import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { Emphasize } from '~/features/projects/components/Emphasize';

export const DisclaimerContent = () => (
  <>
    <Description>
      About eight months after GreenBudget began running on those servers, he was forced to shut
      them down. A few months later, the application resurfaced, rebranded and expanded upon, under
      what is now called{' '}
      <InlineLink element='a' href='https://saturation.io/'>
        Saturation IO
      </InlineLink>
      .
    </Description>
    <Description>
      After that happened, I renamed the project from <Emphasize>GreenBudget</Emphasize> to{' '}
      <Emphasize>HappyBudget</Emphasize> to make sure I was not inadvertently infringing on a
      trademark. This is why the project is sometimes referred to as{' '}
      <Emphasize>HappyBudget</Emphasize>, though <Emphasize>GreenBudget</Emphasize> remains the
      legacy name.
    </Description>
    <Description>
      The circumstances of the situation are still being worked out today. If you are interested in
      hearing more, feel free to reach out to me directly.
    </Description>
  </>
);

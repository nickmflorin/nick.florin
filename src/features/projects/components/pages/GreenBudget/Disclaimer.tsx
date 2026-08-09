'use client';
import { useState } from 'react';

import { ShowMoreLink } from '~/components/buttons/ShowMoreLink';
import { parseDataAttributes, type TypographyVisibilityState } from '~/components/types';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';

import { DisclaimerContent } from './DisclaimerContent';
import { DisclaimerIntro } from './DisclaimerIntro';

/**
 * The disclaimer's body, shown in full on wider screens and collapsed behind a toggle on narrow
 * ones.
 *
 * Which of the two applies is decided in CSS rather than from a measured viewport width. The
 * content is always rendered and always server-rendered; the stylesheet collapses it below the
 * cutoff and hides the toggle above it. Branching on a JavaScript breakpoint instead meant the
 * server had to guess the viewport from the User-Agent, and a wrong guess replaced the entire
 * subtree on hydration.
 */
export const Disclaimer = () => {
  const [disclaimerState, setDisclaimerState] = useState<TypographyVisibilityState>('collapsed');

  return (
    <div className='flex flex-col gap-[4px]'>
      <div className='project-disclaimer'>
        <DisclaimerIntro />
        <div
          {...parseDataAttributes({ state: disclaimerState })}
          className='project-disclaimer__collapse'
        >
          {/* The separation from the intro is a margin on the content rather than a gap on a
              flex parent, so that it is clipped along with the content when collapsed instead of
              leaving a gap below an element of zero height. */}
          <div className='project-disclaimer__collapse-inner'>
            <DescriptionGroup className='mt-[8px]'>
              <DisclaimerContent />
            </DescriptionGroup>
          </div>
        </div>
      </div>
      <ShowMoreLink
        className='md:hidden'
        onClick={() =>
          setDisclaimerState(curr => (curr === 'collapsed' ? 'expanded' : 'collapsed'))
        }
        state={disclaimerState}
      />
    </div>
  );
};

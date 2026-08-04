'use client';
import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { ShowMoreLink } from '~/components/buttons/ShowMoreLink';
import { type TypographyVisibilityState } from '~/components/types';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

import { DisclaimerContent } from './DisclaimerContent';
import { DisclaimerIntro } from './DisclaimerIntro';

const MotionDescriptionGroup = motion(DescriptionGroup);

export const Disclaimer = () => {
  const [disclaimerState, setDisclaimerState] = useState<TypographyVisibilityState>('collapsed');
  const { isLessThanOrEqualTo } = useScreenSizes();

  if (isLessThanOrEqualTo('sm')) {
    return (
      <div className='flex flex-col gap-[4px]'>
        <DescriptionGroup>
          <DisclaimerIntro />
          <AnimatePresence>
            {disclaimerState === 'expanded' ? (
              <MotionDescriptionGroup
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
              >
                <DisclaimerContent />
              </MotionDescriptionGroup>
            ) : null}
          </AnimatePresence>
        </DescriptionGroup>
        <ShowMoreLink
          onClick={() =>
            setDisclaimerState(curr => (curr === 'collapsed' ? 'expanded' : 'collapsed'))
          }
          state={disclaimerState}
        />
      </div>
    );
  }
  return (
    <DescriptionGroup>
      <DisclaimerIntro />
      <DisclaimerContent />
    </DescriptionGroup>
  );
};

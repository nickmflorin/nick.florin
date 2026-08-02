'use client';
import { AnimatePresence, motion } from 'framer-motion';

import { MobileNavigationCutoff } from '~/components/constants';
import { useNavMenu } from '~/hooks';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

export const SiteNavMenuOverlay = () => {
  const { isLessThanOrEqualTo } = useScreenSizes();
  const { close, isOpen } = useNavMenu();

  if (isOpen && isLessThanOrEqualTo(MobileNavigationCutoff)) {
    return (
      <AnimatePresence>
        <motion.div
          animate={{ opacity: '50%' }}
          className='absolute top-0 left-0 w-[100vw] h-[100vh] bg-black z-10'
          exit={{ opacity: '0%' }}
          initial={{ opacity: '0%' }}
          onClick={() => close()}
          transition={{ bounce: 0, type: 'spring' }}
        />
      </AnimatePresence>
    );
  }
  return null;
};

'use client';
import { type ReactNode } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useNavMenu } from '~/hooks';

export interface SiteMenuWrapperProps {
  readonly children: ReactNode;
}

export const SiteNavMenuWrapper = ({ children }: SiteMenuWrapperProps) => {
  const { isOpen } = useNavMenu();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ x: 0 }}
          className='site-nav-menu-wrapper'
          exit={{ x: '100%' }}
          initial={{ x: '100%' }}
          transition={{ bounce: 0, type: 'spring' }}
        >
          <div className='site-nav-menu-container'>{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

import { type CSSProperties, type ReactNode } from 'react';

import { useClickOutside } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';

import { type QuantitativeSize, type ScreenSize, sizeToString } from '~/components/types';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

import { getDrawerWidth } from './drawers';
import { type DrawerId } from './types';

export interface DrawerWrapperProps {
  readonly children?: ReactNode;
  readonly drawerId: DrawerId | null;
  readonly onClose: () => void;
}

/**
 * Returns the inline width style for the drawer, or an empty style object if the screen size is
 * less than or equal to "sm", in which case the width is instead set in SCSS based on the content
 * viewport width.
 */
const getDrawerWrapperWidthStyle = (
  isGreaterThan: (sz: ScreenSize) => boolean,
  width: QuantitativeSize<'px'> | undefined,
): CSSProperties =>
  isGreaterThan('sm') && width !== undefined
    ? {
        maxWidth: sizeToString(width, 'px'),
        minWidth: sizeToString(width, 'px'),
        width: sizeToString(width, 'px'),
      }
    : {};

export const DrawerWrapper = ({ children, drawerId, onClose }: DrawerWrapperProps) => {
  const { isGreaterThan } = useScreenSizes();

  /* See note in MenuItem.tsx regarding the event propagation of touch start and mouse down events
     causing drawers to close for Select's that render their popover content in a portal. */
  const ref = useClickOutside(() => {
    if (!isGreaterThan('sm')) {
      onClose();
    }
  });
  const width = drawerId ? getDrawerWidth(drawerId) : undefined;

  return (
    <AnimatePresence>
      {children && (
        <motion.div
          animate={{ x: 0 }}
          className='drawer-wrapper'
          exit={{ x: '100%' }}
          initial={{ x: '100%' }}
          ref={ref}
          style={getDrawerWrapperWidthStyle(isGreaterThan, width)}
          transition={{ bounce: 0, type: 'spring' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

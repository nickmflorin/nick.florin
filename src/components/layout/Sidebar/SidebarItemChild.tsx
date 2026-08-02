'use client';
import { motion } from 'framer-motion';

import { SidebarAnchor } from '~/components/buttons/SidebarAnchor';

import { type IExternalSidebarItem, type IInternalSidebarItem } from '../types';

import * as constants from './constants';

const itemVariants = {
  closed: ({ index }: { index: number }) => ({
    opacity: 0,
    transition: { y: { stiffness: 1000 } },
    y: `-${constants.calculateChildItemOffsetY(index)}px`,
  }),
  open: () => ({
    opacity: 1,
    y: 0,
  }),
};

export interface SidebarItemChildProps {
  readonly index: number;
  readonly item: IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'>;
}

export const SidebarItemChild = ({ index, item }: SidebarItemChildProps) => (
  <motion.div
    className='w-full h-[48px] aspect-square z-0 mb-[4px] last:mb-0'
    custom={{ index }}
    variants={itemVariants}
  >
    <SidebarAnchor item={item} />
  </motion.div>
);

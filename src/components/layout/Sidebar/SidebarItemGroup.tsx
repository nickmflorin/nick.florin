import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

import { type IInternalGroupedSidebarItem, sidebarItemIsVisible } from '../types';

import * as constants from './constants';
import { SidebarItem } from './SidebarItem';
import { SidebarItemChild } from './SidebarItemChild';

export interface SidebarItemGroupProps {
  readonly isOpen: boolean;
  readonly item: IInternalGroupedSidebarItem;
  readonly onOpen: () => void;
}

const groupVariants = {
  closed: () => ({
    height: `${constants.ItemHeight}px`,
  }),
  open: ({ count }: { count: number }) => ({
    height: `${
      constants.ItemHeight * count +
      constants.ParentItemBottomMargin +
      (count - 1) * constants.ChildItemGap
    }px`,
  }),
};

export const SidebarItemGroup = ({ isOpen, item, onOpen }: SidebarItemGroupProps) => {
  const { user } = useUser();
  return (
    <motion.div
      animate={isOpen ? 'open' : 'closed'}
      className='flex flex-col min-h-[48px] items-center w-full'
      custom={{
        count: item.children.filter(childItem => sidebarItemIsVisible(childItem, user)).length,
      }}
      initial={false}
      variants={groupVariants}
    >
      <SidebarItem isOpen={isOpen} item={item} onOpen={() => onOpen()} />
      <div className='flex flex-col items-center w-full'>
        {item.children
          .filter(childItem => sidebarItemIsVisible(childItem, user))
          .map((child, i) => (
            <SidebarItemChild index={i + 1} item={child} key={child.path} />
          ))}
      </div>
    </motion.div>
  );
};

'use client';
import { Fragment, useState } from 'react';

import { motion } from 'framer-motion';

import { type NavItem } from '~/application/pages';

import { classNames } from '~/components/types';
import { useNavigation } from '~/hooks';

import {
  type IInternalGroupedSidebarItem,
  type ISidebarItem,
  sidebarItemHasChildren,
  sidebarItemIsExternal,
  sidebarItemIsVisible,
} from '../types';

import { SidebarItem } from './SidebarItem';
import { SidebarItemGroup } from './SidebarItemGroup';

const ItemVariants = {
  normal: () => ({}),
  offset: ({ offset }: { offset: number }) => ({
    y: `${offset}px`,
  }),
};

const getPreviousOpenedGroup = ({
  groupOpenIndex,
  pendingItem,
  previousItems,
}: {
  readonly groupOpenIndex: null | number;
  readonly pendingItem: null | Pick<NavItem, 'activePaths' | 'path'>;
  readonly previousItems: ISidebarItem[];
}) => {
  const previousOpenedGroup = previousItems
    .map((it, ind) => ({ ind, item: it }))
    .filter(
      (d): d is { ind: number; item: IInternalGroupedSidebarItem } =>
        sidebarItemHasChildren(d.item) &&
        (d.ind === groupOpenIndex ||
          d.item.children.some(child => child.path === pendingItem?.path)),
    );
  if (previousOpenedGroup.length === 0) {
    return null;
  }
  return previousOpenedGroup[0];
};

const getAnimatedOffset = (params: {
  readonly groupOpenIndex: null | number;
  readonly pendingItem: null | Pick<NavItem, 'activePaths' | 'path'>;
  readonly previousItems: ISidebarItem[];
}) => {
  const previousOpenedGroup = getPreviousOpenedGroup(params);
  if (previousOpenedGroup) {
    return (previousOpenedGroup.item.children.filter(c => sidebarItemIsVisible(c)).length - 1) * 48;
  }
  return 0;
};

export interface LayoutNavProps {
  readonly items: ISidebarItem[];
}

export const Sidebar = ({ items }: LayoutNavProps) => {
  const [groupOpenIndex, setGroupOpenIndex] = useState<null | number>(null);
  const { pendingItem } = useNavigation();

  return (
    <div className='sidebar' onMouseLeave={() => setGroupOpenIndex(null)} role='presentation'>
      <div className='flex flex-col gap-[8px] items-center' role='navigation'>
        {items
          .filter(item => sidebarItemIsVisible(item))
          .map((item, i) => {
            if (!sidebarItemIsExternal(item) && sidebarItemHasChildren(item)) {
              const offset = getAnimatedOffset({
                groupOpenIndex,
                pendingItem,
                previousItems: items
                  .filter(precedingItem => precedingItem.visible !== false)
                  .slice(0, i),
              });
              /* For smaller screens, we want to render the children of the group outside of the
                 group - and hide the group nav item itself. */
              return (
                <Fragment key={item.path + String(i)}>
                  <motion.div
                    animate={offset === 0 ? 'normal' : 'offset'}
                    className='w-full max-md:hidden'
                    custom={{
                      offset,
                    }}
                    initial={false}
                    variants={ItemVariants}
                  >
                    <SidebarItemGroup
                      isOpen={
                        groupOpenIndex === i ||
                        item.children.some(child => child.path === pendingItem?.path)
                      }
                      item={item}
                      onOpen={() => setGroupOpenIndex(i)}
                    />
                  </motion.div>
                  <div
                    className={classNames(
                      'hidden',
                      'max-md:flex max-md:flex-col max-md:gap-[8px] max-md:items-center',
                    )}
                  >
                    {item.children.map((child, index) => (
                      <div className='w-full h-[48px] aspect-square' key={index}>
                        <SidebarItem item={child} />
                      </div>
                    ))}
                  </div>
                </Fragment>
              );
            }
            const offset = getAnimatedOffset({
              groupOpenIndex,
              pendingItem,
              previousItems: items
                .filter(precedingItem => sidebarItemIsVisible(precedingItem))
                .slice(0, i),
            });
            return (
              <motion.div
                animate={offset === 0 ? 'normal' : 'offset'}
                className='w-full h-[48px] aspect-square'
                custom={{
                  offset,
                }}
                initial={false}
                key={item.path + String(i)}
                variants={ItemVariants}
              >
                <SidebarItem item={item} />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

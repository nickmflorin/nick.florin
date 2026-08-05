import { SidebarAnchor } from '~/components/buttons/SidebarAnchor';
import { classNames } from '~/components/types';

import { type ISidebarItem, type SidebarItemHasChildren, sidebarItemIsVisible } from '../types';

export type SidebarItemProps<I extends ISidebarItem> =
  SidebarItemHasChildren<I> extends true
    ? {
        readonly isOpen: boolean;
        readonly item: I;
        readonly onOpen: () => void;
      }
    : {
        readonly isOpen?: never;
        readonly item: I;
        readonly onOpen?: never;
      };

export const SidebarItem = <I extends ISidebarItem>({
  isOpen,
  item,
  onOpen,
}: SidebarItemProps<I>) => (
  <SidebarAnchor
    className={classNames({
      'mb-[6px] last:mb-0':
        isOpen !== undefined &&
        (item.children === undefined ||
          item.children.filter(c => sidebarItemIsVisible(c)).length === 0),
      'mb-[6px] z-10':
        isOpen !== undefined &&
        item.children !== undefined &&
        item.children.filter(c => sidebarItemIsVisible(c)).length !== 0 &&
        isOpen,
      'z-10':
        item.children !== undefined &&
        item.children.filter(c => sidebarItemIsVisible(c)).length !== 0,
    })}
    item={item}
    onMouseEnter={() => onOpen?.()}
  />
);

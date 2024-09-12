import { LayoutNavAnchor } from "~/components/buttons/LayoutNavAnchor";
import { classNames } from "~/components/types";

import { type ILayoutNavItem, type LayoutNavItemHasChildren } from "../types";

export type LayoutNavItemParentProps<I extends ILayoutNavItem> =
  LayoutNavItemHasChildren<I> extends true
    ? {
        readonly item: I;
        readonly isOpen: boolean;
        readonly onOpen: () => void;
      }
    : {
        readonly item: I;
        readonly isOpen?: never;
        readonly onOpen?: never;
      };

export const LayoutNavItem = <I extends ILayoutNavItem>({
  onOpen,
  isOpen,
  item,
}: LayoutNavItemParentProps<I>) => (
  <LayoutNavAnchor
    item={item}
    className={classNames({
      "z-10":
        item.children !== undefined && item.children.filter(c => c.visible !== false).length !== 0,
      "mb-[6px] z-10":
        isOpen !== undefined &&
        item.children !== undefined &&
        item.children.filter(c => c.visible !== false).length !== 0 &&
        isOpen,
      "mb-[6px] last:mb-0":
        isOpen !== undefined &&
        (item.children === undefined ||
          item.children.filter(c => c.visible !== false).length === 0),
    })}
    onMouseEnter={() => onOpen?.()}
  />
);

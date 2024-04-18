import clsx from "clsx";
import { type Required } from "utility-types";

import { LayoutNavAnchor } from "~/components/buttons/LayoutNavAnchor";

import { type ILayoutNavItem, type LayoutNavItemHasChildren } from "./types";

export type LayoutNavItemParentProps<
  I extends ILayoutNavItem | Required<ILayoutNavItem, "children">,
> = LayoutNavItemHasChildren<I> extends true
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

export const LayoutNavItem = <I extends ILayoutNavItem | Required<ILayoutNavItem, "children">>({
  onOpen,
  isOpen,
  item,
}: LayoutNavItemParentProps<I>) => (
  <LayoutNavAnchor
    item={item}
    className={clsx({
      "z-10":
        item.children !== undefined && item.children.filter(c => c.visible !== false).length !== 0,
      "mb-[6px] z-10":
        item.children !== undefined &&
        item.children.filter(c => c.visible !== false).length !== 0 &&
        isOpen,
      "mb-[6px] last:mb-0":
        item.children === undefined || item.children.filter(c => c.visible !== false).length === 0,
    })}
    onMouseEnter={() => onOpen?.()}
  />
);

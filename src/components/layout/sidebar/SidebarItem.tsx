import clsx from "clsx";
import { type Required } from "utility-types";

import { SidebarAnchor } from "~/components/buttons/SidebarAnchor";

import { type ISidebarItem, type SidebarItemHasChildren } from "../types";

export type SidebarItemParentProps<I extends ISidebarItem | Required<ISidebarItem, "children">> =
  SidebarItemHasChildren<I> extends true
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

export const SidebarItem = <I extends ISidebarItem | Required<ISidebarItem, "children">>({
  onOpen,
  isOpen,
  item,
}: SidebarItemParentProps<I>) => (
  <SidebarAnchor
    item={item}
    className={clsx("z-10", {
      "mb-[6px]": item.children !== undefined && item.children.length !== 0 && isOpen,
      "mb-[6px] last:mb-0": item.children === undefined || item.children.length === 0,
    })}
    onMouseEnter={() => onOpen?.()}
  />
);

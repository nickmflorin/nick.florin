import { useUser } from "@clerk/nextjs";

import { SidebarAnchor } from "~/components/buttons/SidebarAnchor";
import { classNames } from "~/components/types";

import { type ISidebarItem, type SidebarItemHasChildren, sidebarItemIsVisible } from "../types";

export type SidebarItemProps<I extends ISidebarItem> =
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

export const SidebarItem = <I extends ISidebarItem>({
  onOpen,
  isOpen,
  item,
}: SidebarItemProps<I>) => {
  const { user } = useUser();
  return (
    <SidebarAnchor
      item={item}
      className={classNames({
        "z-10":
          item.children !== undefined &&
          item.children.filter(c => sidebarItemIsVisible(c, user)).length !== 0,
        "mb-[6px] z-10":
          isOpen !== undefined &&
          item.children !== undefined &&
          item.children.filter(c => sidebarItemIsVisible(c, user)).length !== 0 &&
          isOpen,
        "mb-[6px] last:mb-0":
          isOpen !== undefined &&
          (item.children === undefined ||
            item.children.filter(c => sidebarItemIsVisible(c, user)).length === 0),
      })}
      onMouseEnter={() => onOpen?.()}
    />
  );
};

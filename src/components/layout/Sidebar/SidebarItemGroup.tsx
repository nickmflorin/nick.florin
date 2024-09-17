import { motion } from "framer-motion";

import { useNavigation } from "~/hooks";

import { type IInternalGroupedSidebarItem } from "../types";

import * as constants from "./constants";
import { SidebarItem } from "./SidebarItem";
import { SidebarItemChild } from "./SidebarItemChild";

export interface SidebarItemGroupProps {
  readonly isOpen: boolean;
  readonly item: IInternalGroupedSidebarItem;
  readonly onOpen: () => void;
}

const groupVariants = {
  open: ({ count }: { count: number }) => ({
    height: `${
      constants.ItemHeight * count +
      constants.ParentItemBottomMargin +
      (count - 1) * constants.ChildItemGap
    }px`,
  }),
  closed: () => ({
    height: `${constants.ItemHeight}px`,
  }),
};

export const SidebarItemGroup = ({ item, isOpen: _isOpen, onOpen }: SidebarItemGroupProps) => {
  const { pendingItem } = useNavigation();

  const isOpen = _isOpen || item.children.some(child => child.path === pendingItem?.path);

  return (
    <motion.div
      className="flex flex-col min-h-[48px] items-center w-full"
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={{ count: item.children.filter(item => item.visible !== false).length }}
      variants={groupVariants}
    >
      <SidebarItem item={item} onOpen={() => onOpen()} isOpen={isOpen} />
      <div className="flex flex-col items-center w-full">
        {item.children
          .filter(item => item.visible !== false)
          .map((child, i) => (
            <SidebarItemChild key={child.path} index={i + 1} item={child} />
          ))}
      </div>
    </motion.div>
  );
};

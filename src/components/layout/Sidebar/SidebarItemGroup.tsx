import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

import { type IInternalGroupedSidebarItem, sidebarItemIsVisible } from "../types";

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

export const SidebarItemGroup = ({ item, isOpen, onOpen }: SidebarItemGroupProps) => {
  const { user } = useUser();
  return (
    <motion.div
      className="flex flex-col min-h-[48px] items-center w-full"
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={{ count: item.children.filter(item => sidebarItemIsVisible(item, user)).length }}
      variants={groupVariants}
    >
      <SidebarItem item={item} onOpen={() => onOpen()} isOpen={isOpen} />
      <div className="flex flex-col items-center w-full">
        {item.children
          .filter(item => sidebarItemIsVisible(item, user))
          .map((child, i) => (
            <SidebarItemChild key={child.path} index={i + 1} item={child} />
          ))}
      </div>
    </motion.div>
  );
};

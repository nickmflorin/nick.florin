import { motion } from "framer-motion";
import { type Required } from "utility-types";

import { type ISidebarItem } from "../types";

import * as constants from "./constants";
import { SidebarItem } from "./SidebarItem";
import { SidebarItemChild } from "./SidebarItemChild";

export interface SidebarGroupProps {
  readonly isOpen: boolean;
  readonly item: Required<ISidebarItem, "children">;
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

export const SidebarGroup = ({ item, isOpen, onOpen }: SidebarGroupProps) => (
  <motion.div
    className="flex flex-col min-h-[48px] items-center w-full"
    initial={false}
    animate={isOpen ? "open" : "closed"}
    custom={{ count: item.children.length }}
    variants={groupVariants}
  >
    <SidebarItem item={item} onOpen={() => onOpen()} isOpen={isOpen} />
    <div className="flex flex-col items-center w-full">
      {item.children.map((child, i) => (
        <SidebarItemChild key={i} index={i + 1} item={child} />
      ))}
    </div>
  </motion.div>
);

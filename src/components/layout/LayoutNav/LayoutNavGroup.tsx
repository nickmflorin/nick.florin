import { motion } from "framer-motion";
import { type Required } from "utility-types";

import * as constants from "./constants";
import { LayoutNavItem } from "./LayoutNavItem";
import { LayoutNavItemChild } from "./LayoutNavItemChild";
import { type ILayoutNavItem } from "./types";

export interface LayoutNavGroupProps {
  readonly isOpen: boolean;
  readonly item: Required<ILayoutNavItem, "children">;
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

export const LayoutNavGroup = ({ item, isOpen, onOpen }: LayoutNavGroupProps) => (
  <motion.div
    className="flex flex-col min-h-[48px] items-center w-full"
    initial={false}
    animate={isOpen ? "open" : "closed"}
    custom={{ count: item.children.length }}
    variants={groupVariants}
  >
    <LayoutNavItem item={item} onOpen={() => onOpen()} isOpen={isOpen} />
    <div className="flex flex-col items-center w-full">
      {item.children.map((child, i) => (
        <LayoutNavItemChild key={i} index={i + 1} item={child} />
      ))}
    </div>
  </motion.div>
);

"use client";

import { motion } from "framer-motion";

import { LayoutNavAnchor } from "~/components/buttons/LayoutNavAnchor";

import * as constants from "./constants";
import { type ILayoutNavItem } from "./types";

const itemVariants = {
  open: () => ({
    y: 0,
    opacity: 1,
  }),
  closed: ({ index }: { index: number }) => ({
    y: `-${constants.calculateChildItemOffsetY(index)}px`,
    transition: { y: { stiffness: 1000 } },
    opacity: 0,
  }),
};

export interface LayoutNavItemChildProps {
  readonly index: number;
  readonly item: Omit<ILayoutNavItem, "children">;
}

export const LayoutNavItemChild = ({ index, item }: LayoutNavItemChildProps) => (
  <motion.div
    variants={itemVariants}
    custom={{ index }}
    className="w-full h-[48px] aspect-square z-0 mb-[4px] last:mb-0"
  >
    <LayoutNavAnchor item={item} />
  </motion.div>
);

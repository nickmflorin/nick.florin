"use client";
import { motion } from "framer-motion";

import { SidebarAnchor } from "~/components/buttons/SidebarAnchor";

import { type IExternalSidebarItem, type IInternalSidebarItem } from "../types";

import * as constants from "./constants";

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

export interface SidebarItemChildProps {
  readonly index: number;
  readonly item: Omit<IInternalSidebarItem, "children"> | IExternalSidebarItem;
}

export const SidebarItemChild = ({ index, item }: SidebarItemChildProps) => (
  <motion.div
    variants={itemVariants}
    custom={{ index }}
    className="w-full h-[48px] aspect-square z-0 mb-[4px] last:mb-0"
  >
    <SidebarAnchor item={item} />
  </motion.div>
);

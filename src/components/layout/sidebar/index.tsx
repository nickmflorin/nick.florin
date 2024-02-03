"use client";
import { useState } from "react";

import { motion } from "framer-motion";
import { type Required } from "utility-types";

import { type ISidebarItem, sidebarItemHasChildren } from "../types";

import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";

const ItemVariants = {
  offset: ({ offset }: { offset: number }) => ({
    y: `${offset}px`,
  }),
  normal: () => ({}),
};

export interface SidebarProps {
  readonly items: ISidebarItem[];
}

export const Sidebar = ({ items }: SidebarProps) => {
  const [groupOpenIndex, setGroupOpenIndex] = useState<number | null>(null);

  return (
    <div className="sidebar" onMouseLeave={() => setGroupOpenIndex(null)}>
      <div className="flex flex-col gap-[8px] items-center">
        {items.map((item, i) => {
          if (sidebarItemHasChildren(item)) {
            return (
              <SidebarGroup
                key={i}
                item={item}
                isOpen={groupOpenIndex === i}
                onOpen={() => setGroupOpenIndex(i)}
              />
            );
          }
          const previousWithChildren = items
            .slice(0, i)
            .map((it, ind) => ({ ind, item: it }))
            .filter(
              (d): d is { item: Required<ISidebarItem, "children">; ind: number } =>
                sidebarItemHasChildren(d.item) && d.ind === groupOpenIndex,
            );
          let previous: { item: Required<ISidebarItem, "children">; ind: number } | undefined =
            undefined;
          if (previousWithChildren.length > 0) {
            previous = previousWithChildren[0];
          }

          let offset = 0;
          if (previous) {
            offset = (previous.item.children.length - 1) * 48;
          }

          return (
            <motion.div
              key={i}
              variants={ItemVariants}
              initial={false}
              animate={previous !== undefined ? "offset" : "normal"}
              custom={{ offset }}
              className="w-full h-[48px] aspect-square"
            >
              <SidebarItem item={item} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

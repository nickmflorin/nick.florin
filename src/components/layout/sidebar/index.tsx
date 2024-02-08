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

const getPreviousOpenedGroup = ({
  previousItems,
  groupOpenIndex,
}: {
  previousItems: ISidebarItem[];
  groupOpenIndex: number | null;
}) => {
  const previousOpenedGroup = previousItems
    .map((it, ind) => ({ ind, item: it }))
    .filter(
      (d): d is { item: Required<ISidebarItem, "children">; ind: number } =>
        sidebarItemHasChildren(d.item) && d.ind === groupOpenIndex,
    );
  if (previousOpenedGroup.length === 0) {
    return null;
  }
  return previousOpenedGroup[0];
};

const getAnimatedOffset = ({
  previousItems,
  groupOpenIndex,
}: {
  previousItems: ISidebarItem[];
  groupOpenIndex: number | null;
}) => {
  const previousOpenedGroup = getPreviousOpenedGroup({ previousItems, groupOpenIndex });
  if (previousOpenedGroup) {
    return (previousOpenedGroup.item.children.length - 1) * 48;
  }
  return 0;
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
            const offset = getAnimatedOffset({
              previousItems: items.slice(0, i),
              groupOpenIndex,
            });
            return (
              <motion.div
                key={i}
                variants={ItemVariants}
                initial={false}
                animate={offset !== 0 ? "offset" : "normal"}
                custom={{
                  offset,
                }}
                className="w-full"
              >
                <SidebarGroup
                  item={item}
                  isOpen={groupOpenIndex === i}
                  onOpen={() => setGroupOpenIndex(i)}
                />
              </motion.div>
            );
          }
          const offset = getAnimatedOffset({ previousItems: items.slice(0, i), groupOpenIndex });
          return (
            <motion.div
              key={i}
              variants={ItemVariants}
              initial={false}
              animate={offset !== 0 ? "offset" : "normal"}
              custom={{
                offset,
              }}
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

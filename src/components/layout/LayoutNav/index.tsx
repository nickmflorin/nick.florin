"use client";
import { useState } from "react";

import { motion } from "framer-motion";
import { type Required } from "utility-types";

import { LayoutNavGroup } from "./LayoutNavGroup";
import { LayoutNavItem } from "./LayoutNavItem";
import { type ILayoutNavItem, layoutNavItemHasChildren } from "./types";

export { type ILayoutNavItem } from "./types";

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
  previousItems: ILayoutNavItem[];
  groupOpenIndex: number | null;
}) => {
  const previousOpenedGroup = previousItems
    .map((it, ind) => ({ ind, item: it }))
    .filter(
      (d): d is { item: Required<ILayoutNavItem, "children">; ind: number } =>
        layoutNavItemHasChildren(d.item) && d.ind === groupOpenIndex,
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
  previousItems: ILayoutNavItem[];
  groupOpenIndex: number | null;
}) => {
  const previousOpenedGroup = getPreviousOpenedGroup({ previousItems, groupOpenIndex });
  if (previousOpenedGroup) {
    return (previousOpenedGroup.item.children.length - 1) * 48;
  }
  return 0;
};

export interface LayoutNavProps {
  readonly items: ILayoutNavItem[];
}

export const LayoutNav = ({ items }: LayoutNavProps) => {
  const [groupOpenIndex, setGroupOpenIndex] = useState<number | null>(null);

  return (
    <div className="layout-nav" onMouseLeave={() => setGroupOpenIndex(null)}>
      <div className="flex flex-col gap-[8px] items-center">
        {items.map((item, i) => {
          if (layoutNavItemHasChildren(item)) {
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
                <LayoutNavGroup
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
              <LayoutNavItem item={item} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

"use client";
import React, { useState } from "react";

import { motion } from "framer-motion";

import { classNames } from "~/components/types";

import {
  type ILayoutNavItem,
  layoutNavItemHasChildren,
  layoutNavItemIsExternal,
  type IInternalGroupedLayoutNavItem,
} from "../types";

import { LayoutNavGroup } from "./LayoutNavGroup";
import { LayoutNavItem } from "./LayoutNavItem";

export { type ILayoutNavItem } from "../types";

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
      (d): d is { item: IInternalGroupedLayoutNavItem; ind: number } =>
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
    return (previousOpenedGroup.item.children.filter(c => c.visible !== false).length - 1) * 48;
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
        {items
          .filter(item => item.visible !== false)
          .map((item, i) => {
            if (!layoutNavItemIsExternal(item) && layoutNavItemHasChildren(item)) {
              const offset = getAnimatedOffset({
                previousItems: items.filter(item => item.visible !== false).slice(0, i),
                groupOpenIndex,
              });
              /* For smaller screens, we want to render the children of the group outside of the
                 group - and hide the group nav item itself. */
              return (
                <React.Fragment key={item.path + String(i)}>
                  <motion.div
                    variants={ItemVariants}
                    initial={false}
                    animate={offset !== 0 ? "offset" : "normal"}
                    custom={{
                      offset,
                    }}
                    className="w-full max-md:hidden"
                  >
                    <LayoutNavGroup
                      item={item}
                      isOpen={groupOpenIndex === i}
                      onOpen={() => setGroupOpenIndex(i)}
                    />
                  </motion.div>
                  <div
                    className={classNames(
                      "hidden",
                      "max-md:flex max-md:flex-col max-md:gap-[8px] max-md:items-center",
                    )}
                  >
                    {item.children.map((child, index) => (
                      <LayoutNavItem item={child} key={index} />
                    ))}
                  </div>
                </React.Fragment>
              );
            }
            const offset = getAnimatedOffset({
              previousItems: items.filter(item => item.visible !== false).slice(0, i),
              groupOpenIndex,
            });
            return (
              <motion.div
                key={item.path + String(i)}
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

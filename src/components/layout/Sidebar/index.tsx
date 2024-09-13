"use client";
import React, { useState } from "react";

import { motion } from "framer-motion";

import { classNames } from "~/components/types";

import {
  type ISidebarItem,
  sidebarItemHasChildren,
  sidebarItemIsExternal,
  type IInternalGroupedSidebarItem,
} from "../types";

import { SidebarItem } from "./SidebarItem";
import { SidebarItemGroup } from "./SidebarItemGroup";

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
      (d): d is { item: IInternalGroupedSidebarItem; ind: number } =>
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
    return (previousOpenedGroup.item.children.filter(c => c.visible !== false).length - 1) * 48;
  }
  return 0;
};

export interface LayoutNavProps {
  readonly items: ISidebarItem[];
}

export const Sidebar = ({ items }: LayoutNavProps) => {
  const [groupOpenIndex, setGroupOpenIndex] = useState<number | null>(null);

  return (
    <div className="sidebar" onMouseLeave={() => setGroupOpenIndex(null)}>
      <div className="flex flex-col gap-[8px] items-center">
        {items
          .filter(item => item.visible !== false)
          .map((item, i) => {
            if (!sidebarItemIsExternal(item) && sidebarItemHasChildren(item)) {
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
                    <SidebarItemGroup
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
                      <div key={index} className="w-full h-[48px] aspect-square">
                        <SidebarItem item={child} />
                      </div>
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
                <SidebarItem item={item} />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

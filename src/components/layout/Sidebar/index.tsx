"use client";
import React, { useState } from "react";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

import { type UserResource } from "~/application/auth/roles";
import { type NavItem } from "~/application/pages";

import { classNames } from "~/components/types";
import { useNavigation } from "~/hooks";

import {
  type ISidebarItem,
  sidebarItemHasChildren,
  sidebarItemIsExternal,
  sidebarItemIsVisible,
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
  pendingItem,
}: {
  readonly previousItems: ISidebarItem[];
  readonly groupOpenIndex: number | null;
  readonly pendingItem: Pick<NavItem, "path" | "activePaths"> | null;
}) => {
  const previousOpenedGroup = previousItems
    .map((it, ind) => ({ ind, item: it }))
    .filter(
      (d): d is { item: IInternalGroupedSidebarItem; ind: number } =>
        sidebarItemHasChildren(d.item) &&
        (d.ind === groupOpenIndex ||
          d.item.children.some(child => child.path === pendingItem?.path)),
    );
  if (previousOpenedGroup.length === 0) {
    return null;
  }
  return previousOpenedGroup[0];
};

const getAnimatedOffset = (params: {
  readonly user: UserResource | null | undefined;
  readonly previousItems: ISidebarItem[];
  readonly groupOpenIndex: number | null;
  readonly pendingItem: Pick<NavItem, "path" | "activePaths"> | null;
}) => {
  const previousOpenedGroup = getPreviousOpenedGroup(params);
  if (previousOpenedGroup) {
    return (
      (previousOpenedGroup.item.children.filter(c => sidebarItemIsVisible(c, params.user)).length -
        1) *
      48
    );
  }
  return 0;
};

export interface LayoutNavProps {
  readonly items: ISidebarItem[];
}

export const Sidebar = ({ items }: LayoutNavProps) => {
  const [groupOpenIndex, setGroupOpenIndex] = useState<number | null>(null);
  const { pendingItem } = useNavigation();
  const { user } = useUser();

  return (
    <div className="sidebar" onMouseLeave={() => setGroupOpenIndex(null)}>
      <div className="flex flex-col gap-[8px] items-center">
        {items
          .filter(item => sidebarItemIsVisible(item, user))
          .map((item, i) => {
            if (!sidebarItemIsExternal(item) && sidebarItemHasChildren(item)) {
              const offset = getAnimatedOffset({
                user,
                previousItems: items.filter(item => item.visible !== false).slice(0, i),
                groupOpenIndex,
                pendingItem,
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
                      isOpen={
                        groupOpenIndex === i ||
                        item.children.some(child => child.path === pendingItem?.path)
                      }
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
              user,
              previousItems: items.filter(item => sidebarItemIsVisible(item, user)).slice(0, i),
              groupOpenIndex,
              pendingItem,
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

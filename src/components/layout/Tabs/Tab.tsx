"use client";
import { TabButton } from "~/components/buttons/TabButton";
import { useNavigatable } from "~/hooks";

import { type TabItem } from "./types";

export interface TabProps {
  readonly item: TabItem;
}

export const Tab = ({ item }: TabProps) => {
  const { isActive, isPending, setActiveOptimistically, href } = useNavigatable({ item });
  return (
    <TabButton
      href={href}
      options={{ as: "link" }}
      icon={item.icon}
      isPending={isPending}
      isActive={isActive}
      onClick={() => setActiveOptimistically()}
    >
      {item.label}
    </TabButton>
  );
};

export default Tab;

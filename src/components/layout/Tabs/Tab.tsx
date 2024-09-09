"use client";
import { type LabeledNavItem } from "~/application/pages";

import { TabButton } from "~/components/buttons/TabButton";
import { useNavigatable } from "~/hooks";

export interface TabProps {
  readonly item: LabeledNavItem;
}

export const Tab = ({ item }: TabProps) => {
  const { isActive, isPending, setActiveOptimistically, href } = useNavigatable({
    id: item.path,
    item,
  });
  return (
    <TabButton
      href={href}
      as="link"
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

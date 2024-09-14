"use client";
import { type LabeledNavItem } from "~/application/pages";

import { TabButton } from "~/components/buttons/TabButton";
import { useNavigationItem } from "~/hooks";

export interface TabProps {
  readonly item: LabeledNavItem;
}

export const Tab = ({ item }: TabProps) => {
  const { isActive, isPending, setNavigating, href } = useNavigationItem(item);
  return (
    <TabButton
      href={href}
      element="link"
      className="max-sm:w-full"
      icon={item.icon}
      isPending={isPending}
      isActive={isActive}
      onClick={() => setNavigating()}
    >
      {item.label}
    </TabButton>
  );
};

export default Tab;

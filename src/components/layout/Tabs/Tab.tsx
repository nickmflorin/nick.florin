"use client";
import clsx from "clsx";

import { Button } from "~/components/buttons";
import { useNavigatable } from "~/hooks";

import { type TabItem } from "./types";

export interface TabProps {
  readonly item: TabItem;
}

export const Tab = ({ item }: TabProps) => {
  const { isActive, isPending, setActiveOptimistically, href } = useNavigatable({ item });
  return (
    <Button.Bare
      href={href}
      options={{ as: "link" }}
      className={clsx({ "border border-blue border-b-[2px]": isActive })}
      icon={item.icon}
      isLoading={isPending}
      onClick={() => setActiveOptimistically(true)}
    >
      {item.label}
    </Button.Bare>
  );
};

export default Tab;

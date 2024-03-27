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
      className={clsx(
        "rounded-none rounded-t-md relative top-[2px]",
        "border-b-[2px] text-gray-800",
        "hover:bg-neutral-100",
        {
          "border-transparent hover:border-gray-300": !(isActive || isPending),
          "border-blue-700": isActive || isPending,
        },
      )}
      fontWeight="regular"
      size="medium"
      icon={item.icon}
      isLoading={isPending}
      onClick={() => setActiveOptimistically(true)}
    >
      {item.label}
    </Button.Bare>
  );
};

export default Tab;

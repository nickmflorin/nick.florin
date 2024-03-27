import dynamic from "next/dynamic";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type TabItem } from "./types";

const Tab = dynamic(() => import("./Tab"));

export interface TabsProps extends ComponentProps {
  readonly items: TabItem[];
}

export const Tabs = ({ items, ...props }: TabsProps) => (
  <div
    {...props}
    className={clsx("flex flex-row items-center border-b-[2px] border-gray-200", props.className)}
  >
    {items.map((item, index) => (
      <Tab key={index} item={item} />
    ))}
  </div>
);

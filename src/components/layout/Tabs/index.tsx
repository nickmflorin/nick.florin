import dynamic from "next/dynamic";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type TabItem } from "./types";

const Tab = dynamic(() => import("./Tab"));

export interface TabsProps extends ComponentProps {
  readonly items: TabItem[];
}

export const Tabs = ({ items, ...props }: TabsProps) => (
  <div {...props} className={clsx("flex flex-row items-center", props.className)}>
    {items.map((item, index) => (
      <Tab key={index} item={item} />
    ))}
  </div>
);

import dynamic from "next/dynamic";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type TabItem } from "./types";

const Tab = dynamic(() => import("./Tab"));

export interface TabsProps extends ComponentProps {
  readonly items: TabItem[];
  readonly children?: JSX.Element | JSX.Element[];
}

export const Tabs = ({ items, children, ...props }: TabsProps) => (
  <div
    {...props}
    className={clsx(
      /* The bottom padding of 2px is to make sure that the border on the bottom is not cutoff by
         overflow.  On the other hand, the bottom padding of 8px is for the scrollbar, in the case
         that the tabs overflow the container in mobile views. */
      "flex flex-row items-center overflow-y-hidden w-full max-w-full pb-[2px]",
      "max-md:overflow-x-auto max-md:pb-[8px]",
      props.className,
    )}
  >
    <div
      className={clsx("flex flex-row items-center justify-between border-b-[2px] border-gray-200")}
    >
      <div className="flex flex-row items-center">
        {items.map((item, index) => (
          <Tab key={index} item={item} />
        ))}
      </div>
      {children}
    </div>
  </div>
);

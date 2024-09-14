import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { type LabeledNavItem } from "~/application/pages";

import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { Content } from "./Content";

const Tabs = dynamic(() => import("./Tabs").then(mod => mod.Tabs));

export interface TabbedContentProps extends ComponentProps {
  readonly items: LabeledNavItem[];
  readonly extra?: JSX.Element | JSX.Element[];
  readonly children: ReactNode;
}

export const TabbedContent = ({
  items,
  extra,
  children,
  ...props
}: TabbedContentProps): JSX.Element => (
  <Content outerClassName="max-sm:overflow-y-auto min-h-full">
    <div className="flex flex-col gap-[16px] max-md:gap-[12px] max-h-full">
      <Tabs items={items}>{extra}</Tabs>
      <div
        {...props}
        className={classNames(
          "relative grow min-h-0 max-h-full h-full overflow-y-auto",
          "flex flex-col max-sm:overflow-y-visible",
          props.className,
        )}
      >
        {children}
      </div>
    </div>
  </Content>
);

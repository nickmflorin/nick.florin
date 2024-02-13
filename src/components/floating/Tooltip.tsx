import { type ReactNode } from "react";

import clsx from "clsx";

import { Text } from "~/components/typography/Text";

import { Floating, type FloatingProps } from "./Floating";

export interface TooltipProps extends Omit<FloatingProps, "content"> {
  readonly content: ReactNode;
}

export const Tooltip = ({ children, content, ...props }: TooltipProps) => (
  <Floating
    {...props}
    className={clsx("rounded-sm py-[6px] px-[10px] text-md leading-[14px]", props.className)}
    content={
      typeof content === "string" ? <Text className="whitespace-nowrap">{content}</Text> : content
    }
  >
    {children}
  </Floating>
);

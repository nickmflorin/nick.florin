"use client";
import { type ReactNode } from "react";

import clsx from "clsx";

import { Floating, type FloatingProps } from "./Floating";
import { TooltipContent } from "./TooltipContent";

export interface TooltipProps extends Omit<FloatingProps, "content"> {
  readonly content: ReactNode;
}

export const Tooltip = ({ children, content, ...props }: TooltipProps) => (
  <Floating
    {...props}
    className={clsx("rounded-sm py-[6px] px-[10px] text-md leading-[14px]", props.className)}
    content={({ params, styles, ref }) => (
      <TooltipContent ref={ref} {...params} style={styles}>
        {content}
      </TooltipContent>
    )}
  >
    {children}
  </Floating>
);

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { type FloatingProps } from "./Popover";
import { TooltipContent, type TooltipContentProps } from "./TooltipContent";
import * as types from "./types";

const Popover = dynamic(() => import("./Popover"));

export interface TooltipProps extends Omit<FloatingProps, "content"> {
  readonly content: ReactNode;
  readonly variant?: types.FloatingVariant;
  readonly className?: TooltipContentProps["className"];
}

export const Tooltip = ({
  children,
  content,
  className,
  variant = types.FloatingVariants.SECONDARY,
  ...props
}: TooltipProps) => (
  <Popover
    {...props}
    content={
      <TooltipContent className={className} variant={variant}>
        {content}
      </TooltipContent>
    }
  >
    {children}
  </Popover>
);

export default Tooltip;

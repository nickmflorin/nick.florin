import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { type PopoverProps } from "./Popover";
import { TooltipContent, type TooltipContentProps } from "./TooltipContent";
import * as types from "./types";

const Popover = dynamic(() => import("./Popover"));

export interface TooltipProps extends Omit<PopoverProps, "content"> {
  readonly content: ReactNode;
  readonly variant?: types.PopoverVariant;
  readonly className?: TooltipContentProps["className"];
}

export const Tooltip = ({
  children,
  content,
  className,
  variant = types.PopoverVariants.SECONDARY,
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

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { type FloatingProps } from "./Floating";
import { TooltipContent, type TooltipContentProps } from "./TooltipContent";
import * as types from "./types";

const Floating = dynamic(() => import("./Floating"));

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
  <Floating
    {...props}
    content={
      <TooltipContent className={className} variant={variant}>
        {content}
      </TooltipContent>
    }
  >
    {children}
  </Floating>
);

export default Tooltip;

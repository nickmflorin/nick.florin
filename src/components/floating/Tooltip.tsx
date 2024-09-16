import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { type PopoverProps } from "./Popover";
import { TooltipContent, type TooltipContentProps } from "./TooltipContent";

const Popover = dynamic(() => import("./Popover"));

export interface TooltipProps extends Omit<PopoverProps, "content"> {
  readonly content: ReactNode;
  readonly className?: TooltipContentProps["className"];
}

export const Tooltip = ({ children, content, className, ...props }: TooltipProps) =>
  content ? (
    <Popover {...props} content={<TooltipContent className={className}>{content}</TooltipContent>}>
      {children}
    </Popover>
  ) : (
    <>{children}</>
  );

export default Tooltip;

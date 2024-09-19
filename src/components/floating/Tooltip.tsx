import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { type PopoverRenderProps } from "~/components/floating/types";

import { type PopoverProps } from "./Popover";
import { TooltipContent, type TooltipContentProps } from "./TooltipContent";

const Popover = dynamic(() => import("./Popover"));

export interface NonConditionalTooltipProps extends Omit<PopoverProps, "content"> {
  readonly content: ReactNode;
  readonly isDisabled?: never;
  readonly isEnabled?: never;
  readonly className?: TooltipContentProps["className"];
}

export interface DisabledConditionalTooltipProps
  extends Omit<PopoverProps, "content" | "children"> {
  readonly content: ReactNode;
  readonly isDisabled: boolean;
  readonly isEnabled?: never;
  readonly className?: TooltipContentProps["className"];
  readonly children: JSX.Element | ((params: Partial<PopoverRenderProps>) => JSX.Element);
}

export interface EnabledConditionalTooltipProps extends Omit<PopoverProps, "content" | "children"> {
  readonly content: ReactNode;
  readonly isEnabled: boolean;
  readonly isDisabled?: never;
  readonly className?: TooltipContentProps["className"];
  readonly children: JSX.Element | ((params: Partial<PopoverRenderProps>) => JSX.Element);
}

export type TooltipProps =
  | EnabledConditionalTooltipProps
  | DisabledConditionalTooltipProps
  | NonConditionalTooltipProps;

export const Tooltip = ({
  children,
  content,
  className,
  isEnabled,
  isDisabled,
  ...props
}: TooltipProps) => {
  if (isEnabled !== undefined || isDisabled !== undefined) {
    if (typeof children === "function") {
      if (isEnabled === false || isDisabled === true) {
        return <>{children({ ref: undefined, isOpen: undefined, params: undefined })}</>;
      }
      return (
        <Popover
          {...props}
          content={<TooltipContent className={className}>{content}</TooltipContent>}
        >
          {children}
        </Popover>
      );
    } else if (isEnabled === false || isDisabled === true) {
      return <>{children}</>;
    }
    return (
      <Popover
        {...props}
        content={<TooltipContent className={className}>{content}</TooltipContent>}
      >
        {children}
      </Popover>
    );
  }
  return (
    <Popover {...props} content={<TooltipContent className={className}>{content}</TooltipContent>}>
      {children}
    </Popover>
  );
};

export default Tooltip;

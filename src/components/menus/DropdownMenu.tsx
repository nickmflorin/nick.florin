import { type FloatingContentRenderProps } from "~/components/floating";
import { Popover, type PopoverProps } from "~/components/floating/Popover";
import { PopoverContent } from "~/components/floating/PopoverContent";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface DropdownMenuProps
  extends Pick<
    PopoverProps,
    | "placement"
    | "allowedPlacements"
    | "inPortal"
    | "autoUpdate"
    | "middleware"
    | "offset"
    | "width"
    | "withArrow"
    | "isDisabled"
    | "maxHeight"
    | "triggers"
    | "children"
  > {
  readonly contentClassName?: ComponentProps["className"];
  readonly contentStyle?: ComponentProps["style"];
  readonly content:
    | JSX.Element
    | ((params: Pick<FloatingContentRenderProps, "isOpen" | "setIsOpen">) => JSX.Element);
}

export const DropdownMenu = ({
  children,
  contentClassName,
  contentStyle,
  content,
  placement = "bottom",
  offset = { mainAxis: 4 },
  triggers = ["click"],
  ...props
}: DropdownMenuProps) => (
  <Popover
    {...props}
    placement={placement}
    offset={offset}
    triggers={triggers}
    content={({ ref, params, styles, isOpen, setIsOpen }) => (
      <PopoverContent
        ref={ref}
        {...params}
        style={{ ...contentStyle, ...styles }}
        className={classNames("p-[0px] rounded-md overflow-hidden", contentClassName)}
      >
        {typeof content === "function" ? content({ isOpen, setIsOpen }) : content}
      </PopoverContent>
    )}
  >
    {children}
  </Popover>
);

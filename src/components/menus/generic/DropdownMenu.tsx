import dynamic from "next/dynamic";

import clsx from "clsx";

import type * as types from "../types";

import { Loading } from "~/components/feedback/Loading";
import { Popover, type PopoverProps } from "~/components/floating/Popover";
import { PopoverContent } from "~/components/floating/PopoverContent";
import type { ComponentProps } from "~/components/types";

const Menu = dynamic(() => import("~/components/menus/generic/Menu"), {
  loading: () => <Loading isLoading={true} className="h-[80px]" />,
}) as types.MenuComponent;

export interface DropdownMenuProps<M extends types.MenuModel, O extends types.MenuOptions<M>>
  extends Omit<types.MenuProps<M, O>, "children">,
    ComponentProps,
    Pick<
      PopoverProps,
      | "placement"
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
  readonly content?: JSX.Element;
}

export const DropdownMenu = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  placement = "bottom",
  inPortal = false,
  autoUpdate = false,
  middleware,
  offset = { mainAxis: 4 },
  width = "target",
  withArrow = false,
  isDisabled = false,
  maxHeight,
  children,
  triggers = ["click"],
  content,
  className,
  style,
  ...props
}: DropdownMenuProps<M, O>) => (
  <Popover
    isDisabled={isDisabled}
    middleware={middleware}
    placement={placement}
    triggers={triggers}
    width={width}
    withArrow={withArrow}
    offset={offset}
    autoUpdate={autoUpdate}
    maxHeight={maxHeight}
    inPortal={inPortal}
    content={
      <PopoverContent
        style={style}
        className={clsx("p-[0px] rounded-md overflow-hidden", className)}
        variant="white"
      >
        {content ? content : <Menu {...props} />}
      </PopoverContent>
    }
  >
    {children}
  </Popover>
);

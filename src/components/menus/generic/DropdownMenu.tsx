"use client";
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

type WithDropdownMenuProps<T> = Omit<T, "children"> &
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
  >;

export interface DropdownMenuContentlessProps extends WithDropdownMenuProps<ComponentProps> {
  readonly content?: never;
}

export interface DropdownMenuComponentProps
  extends WithDropdownMenuProps<types.MenuComponentProps> {
  readonly content?: JSX.Element;
}

export interface DropdownMenuDataProps<M extends types.MenuModel, O extends types.MenuOptions<M>>
  extends WithDropdownMenuProps<types.MenuDataProps<M, O>> {
  readonly content?: JSX.Element;
}

export type DropdownMenuProps<M extends types.MenuModel, O extends types.MenuOptions<M>> =
  | DropdownMenuComponentProps
  | DropdownMenuContentlessProps
  | DropdownMenuDataProps<M, O>;

export const DropdownMenu = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  placement = "bottom",
  inPortal = false,
  autoUpdate = false,
  middleware,
  offset = { mainAxis: 4 },
  width,
  withArrow = false,
  isDisabled = false,
  maxHeight,
  children,
  triggers = ["click"],
  className,
  style,
  content,
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
        {content ? (
          content
        ) : (
          <Menu {...(props as types.MenuDataProps<M, O> | types.MenuComponentProps)} />
        )}
      </PopoverContent>
    }
  >
    {children}
  </Popover>
);

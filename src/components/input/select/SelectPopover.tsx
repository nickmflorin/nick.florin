"use client";
import React from "react";
import { useState, forwardRef, type ForwardedRef, useImperativeHandle } from "react";

import { omit, pick } from "lodash-es";

import { Popover, type PopoverProps } from "~/components/floating/Popover";
import {
  type PopoverRenderProps,
  type FloatingContentRenderProps,
} from "~/components/floating/types";

export type SelectPopoverInstance = {
  readonly setOpen: (isOpen: boolean) => void;
};

interface InnerSelectPopoverProps
  extends Pick<
    PopoverProps,
    | "inPortal"
    | "maxHeight"
    | "autoUpdate"
    | "placement"
    | "allowedPlacements"
    | "width"
    | "offset"
    | "isDisabled"
  > {
  readonly isReady?: boolean;
  readonly content: JSX.Element | ((props: FloatingContentRenderProps) => JSX.Element);
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
    isOpen: boolean,
  ) => void;
  readonly children: (params: PopoverRenderProps & { readonly isOpen: boolean }) => JSX.Element;
}

const InnerSelectPopover = forwardRef(
  (
    {
      offset = { mainAxis: 2 },
      width = "target",
      isReady,
      maxHeight = "240px",
      content,
      children,
      ...props
    }: InnerSelectPopoverProps,
    ref: ForwardedRef<SelectPopoverInstance>,
  ): JSX.Element => {
    const [isOpen, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      setOpen,
    }));

    return (
      <Popover
        /* Note: Using autoUpdate for the Select is particularly important - especially for Select
           elements inside of Forms that exist in Drawers - because the first time the Select is
           opened after initial render, the Select's content menu will appear with the best
           placement (bottom or top), based on the 'autoPlacement' middleware used below.
           Otherwise, the optimal autoPlacement does not seem to take appropriate effect until the
           second time the Select is opened, after the initial render (for unknown reasons).

           However, it can be a performance hog - so we should leave it off for now, and investigate
           further to see exactly what performance impact it has as well as why the Select seems
           to not appropriately use the 'autoPlacement' behavior when inside of a Drawer during the
           first open of the Select's menu content. */
        autoUpdate={false}
        allowedPlacements={["bottom", "top"]}
        {...props}
        triggers={["click"]}
        width={width}
        maxHeight={maxHeight}
        withArrow={false}
        offset={offset}
        isOpen={isOpen}
        isDisabled={isReady === false || props.isDisabled}
        onOpenChange={(isOpen, evt) => {
          setOpen(isOpen);
          props.onOpenChange?.(evt, isOpen);
        }}
        content={
          typeof content === "function" ? renderProps => content({ ...renderProps }) : content
        }
      >
        {({ ref: _ref, params }) => children({ ref: _ref, params, isOpen })}
      </Popover>
    );
  },
);

export interface SelectPopoverProps
  extends Pick<
    InnerSelectPopoverProps,
    "inPortal" | "content" | "onOpen" | "onClose" | "onOpenChange" | "children" | "isReady"
  > {
  readonly popoverMaxHeight?: InnerSelectPopoverProps["maxHeight"];
  readonly popoverPlacement?: InnerSelectPopoverProps["placement"];
  readonly popoverAllowedPlacements?: InnerSelectPopoverProps["allowedPlacements"];
  readonly popoverWidth?: InnerSelectPopoverProps["width"];
  readonly popoverOffset?: InnerSelectPopoverProps["offset"];
  readonly popoverAutoUpdate?: InnerSelectPopoverProps["autoUpdate"];
}

export const SelectPopoverPropsMap = {
  inPortal: true,
  content: true,
  popoverMaxHeight: true,
  popoverAllowedPlacements: true,
  popoverPlacement: true,
  popoverWidth: true,
  popoverOffset: true,
  popoverAutoUpdate: true,
  onOpen: true,
  onClose: true,
  onOpenChange: true,
  children: true,
  isReady: true,
} as const satisfies {
  [key in keyof Required<SelectPopoverProps>]: true;
};

export const omitSelectPopoverProps = <P extends Record<string, unknown>>(
  props: P,
): Omit<P, keyof typeof SelectPopoverPropsMap & keyof P> =>
  omit(props, Object.keys(SelectPopoverPropsMap) as (keyof Required<SelectPopoverProps>)[]);

export const pickSelectPopoverProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, keyof typeof SelectPopoverPropsMap & keyof P> =>
  pick(props, Object.keys(SelectPopoverPropsMap) as (keyof Required<SelectPopoverProps>)[]);

export const SelectPopover = forwardRef(
  (
    {
      popoverAllowedPlacements,
      popoverAutoUpdate,
      popoverMaxHeight,
      popoverOffset,
      popoverPlacement,
      popoverWidth,
      ...props
    }: SelectPopoverProps,
    ref: ForwardedRef<SelectPopoverInstance>,
  ): JSX.Element => (
    <InnerSelectPopover
      {...props}
      ref={ref}
      allowedPlacements={popoverAllowedPlacements}
      placement={popoverPlacement}
      width={popoverWidth}
      offset={popoverOffset}
      maxHeight={popoverMaxHeight}
      autoUpdate={popoverAutoUpdate}
    />
  ),
);

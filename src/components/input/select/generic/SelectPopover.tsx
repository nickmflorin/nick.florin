"use client";
import React from "react";
import { useState, forwardRef, type ForwardedRef, useImperativeHandle, useMemo } from "react";

import { autoPlacement } from "@floating-ui/react";

import type * as types from "../types";

import { Popover, type PopoverProps } from "~/components/floating/Popover";
import { type PopoverRenderProps } from "~/components/floating/types";

export interface SelectPopoverProps
  extends Pick<PopoverProps, "inPortal" | "content" | "maxHeight"> {
  readonly menuPlacement?: PopoverProps["placement"];
  readonly menuOffset?: PopoverProps["offset"];
  readonly menuWidth?: PopoverProps["width"];
  readonly isLoading?: boolean;
  readonly isReady?: boolean;
  readonly onOpen?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: { select: types.SelectInstance },
  ) => void;
  readonly onClose?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    params: { select: types.SelectInstance },
  ) => void;
  readonly onOpenChange?: (
    e: Event | React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean,
    params: { select: types.SelectInstance },
  ) => void;
  readonly children: (
    params: PopoverRenderProps & { readonly isOpen: boolean; readonly isLoading: boolean },
  ) => JSX.Element;
}

export const SelectPopover = forwardRef<types.SelectInstance, SelectPopoverProps>(
  (
    {
      content,
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      menuWidth = "target",
      isLoading: _propIsLoading,
      isReady,
      children,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectPopoverProps,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const [_isLoading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);

    const isLoading = _propIsLoading || _isLoading;

    const select: types.SelectInstance = useMemo(
      () => ({
        setOpen,
        setLoading,
      }),
      [setOpen, setLoading],
    );

    useImperativeHandle(ref, () => select);

    return (
      <Popover
        {...props}
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
        //  autoUpdate
        placement={menuPlacement}
        middleware={[autoPlacement({ allowedPlacements: ["bottom", "top"] })]}
        triggers={["click"]}
        width={menuWidth}
        withArrow={false}
        offset={menuOffset}
        isOpen={isOpen}
        isDisabled={isReady === false}
        onOpen={e => onOpen?.(e, { select })}
        onClose={e => onClose?.(e, { select })}
        onOpenChange={(isOpen, evt) => {
          setOpen(isOpen);
          onOpenChange?.(evt, isOpen, { select });
        }}
        content={content}
      >
        {({ ref: _ref, params }) => children({ ref: _ref, params, isOpen, isLoading })}
      </Popover>
    );
  },
);
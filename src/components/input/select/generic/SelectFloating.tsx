"use client";
import React from "react";
import { useState, forwardRef, type ForwardedRef, useImperativeHandle, useMemo } from "react";

import { autoPlacement } from "@floating-ui/react";

import type * as types from "../types";

import { Floating, type FloatingProps } from "~/components/floating/Floating";
import { type FloatingRenderProps } from "~/components/floating/types";

export interface SelectFloatingProps
  extends Pick<FloatingProps, "inPortal" | "content" | "maxHeight"> {
  readonly menuPlacement?: FloatingProps["placement"];
  readonly menuOffset?: FloatingProps["offset"];
  readonly menuWidth?: FloatingProps["width"];
  readonly isLoading?: boolean;
  readonly isReady?: boolean;
  readonly onOpen?: (e: Event, params: { select: types.SelectInstance }) => void;
  readonly onClose?: (e: Event, params: { select: types.SelectInstance }) => void;
  readonly onOpenChange?: (
    e: Event,
    isOpen: boolean,
    params: { select: types.SelectInstance },
  ) => void;
  readonly children: (
    params: FloatingRenderProps & { readonly isOpen: boolean; readonly isLoading: boolean },
  ) => JSX.Element;
}

export const SelectFloating = forwardRef<types.SelectInstance, SelectFloatingProps>(
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
    }: SelectFloatingProps,
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
      <Floating
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
      </Floating>
    );
  },
);

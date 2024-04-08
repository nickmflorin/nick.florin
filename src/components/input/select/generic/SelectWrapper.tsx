"use client";
import React from "react";
import { useState, forwardRef, type ForwardedRef, useImperativeHandle, useMemo } from "react";

import { autoPlacement } from "@floating-ui/react";

import type * as types from "../types";

import { Floating, type FloatingProps } from "~/components/floating/Floating";
import { type FloatingRenderProps } from "~/components/floating/types";

export interface SelectWrapperProps
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

export const SelectWrapper = forwardRef<types.SelectInstance, SelectWrapperProps>(
  (
    {
      children,
      content,
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      menuWidth = "target",
      isLoading: _propIsLoading,
      isReady,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: SelectWrapperProps,
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
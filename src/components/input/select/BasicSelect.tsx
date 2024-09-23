"use client";
import React, {
  type ReactNode,
  forwardRef,
  type ForwardedRef,
  useRef,
  useImperativeHandle,
} from "react";

import { type Optional } from "utility-types";

import type * as types from "~/components/input/select/types";
import { type ComponentProps } from "~/components/types";

import {
  BasicSelectInput,
  type BasicSelectInputProps,
  type BasicSelectInputInstance,
} from "./BasicSelectInput";
import { SelectPopover, type SelectPopoverProps } from "./SelectPopover";
import { SelectPopoverContent } from "./SelectPopoverContent";

export interface BasicSelectProps
  extends Optional<
      Omit<SelectPopoverProps, "autoUpdate" | "content" | keyof ComponentProps>,
      "children"
    >,
    Omit<BasicSelectInputProps, keyof ComponentProps | "isOpen" | "children" | "value"> {
  readonly menuClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly autoUpdatePopover?: boolean;
  readonly content: JSX.Element;
  readonly renderedValue?: ReactNode;
}

export const BasicSelect = forwardRef<types.BasicSelectInstance, BasicSelectProps>(
  (
    {
      menuOffset = { mainAxis: 2 },
      menuPlacement,
      menuWidth = "target",
      isLoading,
      inPortal,
      menuClassName,
      inputClassName,
      maxHeight = 240,
      isReady = true,
      dynamicHeight = true,
      autoUpdatePopover = false,
      content,
      renderedValue,
      children,
      onOpen,
      onClose,
      onOpenChange,
      ...props
    }: BasicSelectProps,
    ref: ForwardedRef<types.BasicSelectInstance>,
  ): JSX.Element => {
    const innerRef = useRef<Omit<types.BasicSelectInstance, "focusInput"> | null>(null);
    const innerInputRef = useRef<BasicSelectInputInstance | null>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => innerInputRef.current?.focus(),
      setOpen: (v: boolean) => innerRef.current?.setOpen(v),
      setLoading: (v: boolean) => innerRef.current?.setLoading(v),
    }));

    return (
      <SelectPopover
        ref={innerRef}
        maxHeight={maxHeight}
        isReady={isReady}
        isLoading={isLoading}
        menuPlacement={menuPlacement}
        menuWidth={menuWidth}
        inPortal={inPortal}
        menuOffset={menuOffset}
        autoUpdate={autoUpdatePopover}
        onOpen={onOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
        content={
          <SelectPopoverContent className={menuClassName} inPortal={inPortal}>
            {content}
          </SelectPopoverContent>
        }
      >
        {children ??
          (({ ref: _ref, params, isOpen, isLoading }) => (
            <BasicSelectInput
              {...params}
              {...props}
              dynamicHeight={dynamicHeight}
              isOpen={isOpen}
              isLoading={isLoading}
              ref={instance => {
                _ref(instance);
                if (instance) {
                  innerInputRef.current = instance;
                }
              }}
              className={inputClassName}
            >
              {renderedValue}
            </BasicSelectInput>
          ))}
      </SelectPopover>
    );
  },
);

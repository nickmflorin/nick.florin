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
  RootSelectInput,
  type RootSelectInputProps,
  type RootSelectInputInstance,
} from "./RootSelectInput";
import {
  SelectPopover,
  type SelectPopoverProps,
  pickSelectPopoverProps,
  omitSelectPopoverProps,
  type SelectPopoverInstance,
} from "./SelectPopover";
import { SelectPopoverContent } from "./SelectPopoverContent";

export interface RootSelectProps
  extends Omit<Optional<SelectPopoverProps, "children">, "content">,
    Omit<RootSelectInputProps, keyof ComponentProps | "isOpen" | "children" | "value"> {
  readonly popoverClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly inputIsLoading?: boolean;
  readonly renderedValue?: ReactNode;
  readonly content: JSX.Element;
}

export const RootSelect = forwardRef(
  (
    {
      isLoading,
      inPortal,
      popoverClassName,
      inputClassName,
      dynamicHeight = true,
      content,
      renderedValue,
      inputIsLoading,
      contentIsLoading,
      children,
      ...props
    }: RootSelectProps,
    ref: ForwardedRef<types.RootSelectInstance>,
  ): JSX.Element => {
    const popoverRef = useRef<SelectPopoverInstance | null>(null);
    const inputRef = useRef<RootSelectInputInstance | null>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => inputRef.current?.focus(),
      setInputLoading: (v: boolean) => inputRef.current?.setLoading(v),
      setOpen: (v: boolean) => popoverRef.current?.setOpen(v),
      setLoading: (v: boolean) => {
        popoverRef.current?.setContentLoading(v);
        inputRef.current?.setLoading(v);
      },
      setContentLoading: (v: boolean) => popoverRef.current?.setContentLoading(v),
    }));

    return (
      <SelectPopover
        {...pickSelectPopoverProps(props)}
        ref={popoverRef}
        contentIsLoading={contentIsLoading || isLoading}
        inPortal={inPortal}
        content={({ params, ref, styles, contentIsLoading }) => (
          <SelectPopoverContent
            {...params}
            style={styles}
            ref={ref}
            className={popoverClassName}
            inPortal={inPortal}
            isLoading={contentIsLoading}
          >
            {content}
          </SelectPopoverContent>
        )}
      >
        {children ??
          (({ ref: _ref, params, isOpen }) => (
            <RootSelectInput
              {...params}
              {...omitSelectPopoverProps(props)}
              dynamicHeight={dynamicHeight}
              isOpen={isOpen}
              isLoading={inputIsLoading || isLoading}
              ref={instance => {
                _ref(instance);
                if (instance) {
                  inputRef.current = instance;
                }
              }}
              className={inputClassName}
            >
              {renderedValue}
            </RootSelectInput>
          ))}
      </SelectPopover>
    );
  },
);

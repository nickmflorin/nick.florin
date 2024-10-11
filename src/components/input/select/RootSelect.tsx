"use client";
import React, {
  type ReactNode,
  forwardRef,
  useState,
  type ForwardedRef,
  useRef,
  useImperativeHandle,
} from "react";

import { type Optional } from "utility-types";

import type { FloatingContentRenderProps } from "~/components/floating";
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
  extends Omit<Optional<SelectPopoverProps, "children">, "content" | "isLoading">,
    Omit<
      RootSelectInputProps,
      keyof ComponentProps | "isOpen" | "children" | "value" | "isLoading"
    > {
  readonly popoverClassName?: ComponentProps["className"];
  readonly inputClassName?: ComponentProps["className"];
  readonly inputIsLoading?: boolean;
  readonly popoverIsLoading?: boolean;
  readonly renderedValue?: ReactNode;
  readonly content:
    | JSX.Element
    | ((params: Pick<FloatingContentRenderProps, "isOpen" | "setIsOpen">) => JSX.Element);
}

export const RootSelect = forwardRef(
  (
    {
      popoverIsLoading: _propPopoverIsLoading,
      inPortal,
      popoverClassName,
      inputClassName,
      dynamicHeight = true,
      content,
      renderedValue,
      inputIsLoading,
      children,
      ...props
    }: RootSelectProps,
    ref: ForwardedRef<types.RootSelectInstance>,
  ): JSX.Element => {
    const [_popoverIsLoading, setPopoverIsLoading] = useState(false);

    const popoverRef = useRef<SelectPopoverInstance | null>(null);
    const inputRef = useRef<RootSelectInputInstance | null>(null);

    const popoverIsLoading = _propPopoverIsLoading || _popoverIsLoading;

    useImperativeHandle(ref, () => ({
      focusInput: () => inputRef.current?.focus(),
      setOpen: (v: boolean) => popoverRef.current?.setOpen(v),
      setPopoverLoading: (v: boolean) => setPopoverIsLoading(v),
      setInputLoading: (v: boolean) => inputRef.current?.setLoading(v),
    }));

    return (
      <SelectPopover
        {...pickSelectPopoverProps(props)}
        ref={popoverRef}
        inPortal={inPortal}
        content={({ params, ref: _ref, styles, isOpen, setIsOpen }) => (
          <SelectPopoverContent
            {...params}
            style={styles}
            ref={_ref}
            className={popoverClassName}
            inPortal={inPortal}
            isLoading={popoverIsLoading}
          >
            {typeof content === "function" ? content({ isOpen, setIsOpen }) : content}
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
              isLoading={inputIsLoading}
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

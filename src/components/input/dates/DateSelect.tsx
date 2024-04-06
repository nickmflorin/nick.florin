"use client";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { useRef, forwardRef, type ForwardedRef, useState } from "react";

import { type DateTime } from "luxon";

import type * as types from "../select/types";

import { Loading } from "~/components/feedback/Loading";
import { type FloatingProps } from "~/components/floating/Floating";
import { FloatingContent } from "~/components/floating/FloatingContent";
import { type ComponentProps } from "~/components/types";

import { SelectInput, type SelectInputProps } from "../select/generic/SelectInput";
import { SelectWrapper, type SelectWrapperProps } from "../select/generic/SelectWrapper";

import { toDateTime } from "./util";

const DatePicker = dynamic(() => import("./DatePicker"), {
  loading: () => <Loading isLoading={true} />,
});

export interface DateSelectProps
  extends Omit<SelectWrapperProps, "content" | "children" | "isReady">,
    Omit<SelectInputProps, "isOpen" | "dynamicHeight" | "children" | "showPlaceholder"> {
  readonly value: Date | string | null;
  readonly children?: FloatingProps["children"];
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly formatString?: string;
  readonly onChange?: (v: DateTime | null) => void;
}

export const DateSelect = forwardRef<types.SelectInstance, DateSelectProps>(
  (
    {
      children,
      isLocked,
      size,
      isDisabled,
      inputClassName,
      actions,
      placeholder,
      value,
      closeMenuOnSelect,
      formatString = "yyyy-MM-dd",
      onChange,
      ...props
    }: DateSelectProps,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const internalInstance = useRef<types.SelectInstance | null>(null);

    const [v, setV] = useState<DateTime | null>(toDateTime(value));

    useEffect(() => {
      setV(toDateTime(value));
    }, [value]);

    return (
      <SelectWrapper
        menuWidth="target"
        {...props}
        ref={instance => {
          if (instance) {
            internalInstance.current = instance;
            if (typeof ref === "function") {
              ref(instance);
            } else if (ref) {
              ref.current = instance;
            }
          }
        }}
        content={
          <FloatingContent variant="white">
            <DatePicker
              value={value}
              onChange={dt => {
                setV(dt);
                onChange?.(dt);
                if (closeMenuOnSelect) {
                  internalInstance.current?.setOpen(false);
                }
              }}
            />
          </FloatingContent>
        }
      >
        {children ||
          (({ ref, params, isOpen, isLoading }) => (
            <SelectInput
              {...params}
              dynamicHeight={false}
              ref={ref}
              actions={actions}
              placeholder={placeholder}
              isOpen={isOpen}
              isLoading={isLoading}
              isLocked={isLocked}
              size={size}
              isDisabled={isDisabled}
              className={inputClassName}
            >
              {v ? v.toFormat(formatString) : ""}
            </SelectInput>
          ))}
      </SelectWrapper>
    );
  },
);

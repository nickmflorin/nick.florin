"use client";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { useRef, forwardRef, type ForwardedRef, useState } from "react";

import { DateTime } from "luxon";
import { type Optional } from "utility-types";

import type * as types from "../select/types";

import { Loading } from "~/components/feedback/Loading";
import { FloatingContent } from "~/components/floating/FloatingContent";
import { type ComponentProps } from "~/components/types";

import { SelectFloating, type SelectFloatingProps } from "../select/generic/SelectFloating";
import { SelectInput, type SelectInputProps } from "../select/generic/SelectInput";

import { toDateTime } from "./util";

const DatePicker = dynamic(() => import("./DatePicker"), {
  loading: () => <Loading isLoading={true} />,
});

export interface DateSelectProps
  extends Optional<Omit<SelectFloatingProps, "content" | "isReady">, "children">,
    Omit<SelectInputProps, "isOpen" | "dynamicHeight" | "children" | "showPlaceholder"> {
  readonly value: Date | string | null;
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly formatString?: string;
  readonly onChange?: (v: Date | null) => void;
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
      closeMenuOnSelect = true,
      formatString = "yyyy-MM-dd",
      onChange,
      ...props
    }: DateSelectProps,
    ref: ForwardedRef<types.SelectInstance>,
  ): JSX.Element => {
    const internalInstance = useRef<types.SelectInstance | null>(null);

    const [v, setV] = useState<Date | null>(toDateTime(value)?.toJSDate() ?? null);

    useEffect(() => {
      setV(toDateTime(value)?.toJSDate() ?? null);
    }, [value]);

    return (
      <SelectFloating
        menuWidth="target"
        {...props}
        maxHeight="fit-content"
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
          <FloatingContent variant="white" className="select__dates-content min-h-[100px]">
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
              {v ? DateTime.fromJSDate(v).toFormat(formatString) : ""}
            </SelectInput>
          ))}
      </SelectFloating>
    );
  },
);

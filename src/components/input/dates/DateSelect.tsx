"use client";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { useRef, forwardRef, type ForwardedRef, useState } from "react";

import { DateTime } from "luxon";
import { type Optional } from "utility-types";

import type * as types from "../select/types";

import { PopoverContent } from "~/components/floating/PopoverContent";
import { Loading } from "~/components/loading/Loading";
import { type ComponentProps } from "~/components/types";

import { BaseSelectInput } from "../select/BaseSelectInput";
import { SelectPopover } from "../select/SelectPopover";

import { toDateTime } from "./util";

const DatePicker = dynamic(() => import("./DatePicker"), {
  loading: () => <Loading isLoading={true} />,
});

export interface DateSelectProps
  extends Optional<Omit<types.SelectPopoverProps, "content" | "isReady">, "children">,
    Omit<types.BaseSelectInputProps, "isOpen" | "dynamicHeight" | "children" | "showPlaceholder"> {
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
      <SelectPopover
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
          <PopoverContent variant="white" className="select__dates-content min-h-[100px]">
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
          </PopoverContent>
        }
      >
        {children ||
          (({ ref, params, isOpen, isLoading }) => (
            <BaseSelectInput
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
            </BaseSelectInput>
          ))}
      </SelectPopover>
    );
  },
);

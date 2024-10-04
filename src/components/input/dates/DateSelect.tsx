"use client";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { useRef, forwardRef, type ForwardedRef, useState } from "react";

import { DateTime } from "luxon";
import { type Optional } from "utility-types";

import { PopoverContent } from "~/components/floating/PopoverContent";
import { Loading } from "~/components/loading/Loading";
import { type ComponentProps } from "~/components/types";

import { RootSelectInput, type RootSelectInputProps } from "../select/RootSelectInput";
import {
  SelectPopover,
  type SelectPopoverProps,
  type SelectPopoverInstance,
} from "../select/SelectPopover";

import { toDateTime } from "./util";

const DatePicker = dynamic(() => import("./DatePicker"), {
  loading: () => <Loading isLoading={true} />,
});

export interface DateSelectProps
  extends Optional<Omit<SelectPopoverProps, "content" | "isReady">, "children">,
    Omit<RootSelectInputProps, "isOpen" | "dynamicHeight" | "children" | "showPlaceholder"> {
  readonly value: Date | string | null;
  readonly inputClassName?: ComponentProps["className"];
  readonly closeMenuOnSelect?: boolean;
  readonly formatString?: string;
  readonly onChange?: (v: Date | null) => void;
}

export const DateSelect = forwardRef(
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
    ref: ForwardedRef<SelectPopoverInstance | null>,
  ): JSX.Element => {
    const internalInstance = useRef<SelectPopoverInstance | null>(null);

    const [v, setV] = useState<Date | null>(toDateTime(value)?.toJSDate() ?? null);

    useEffect(() => {
      setV(toDateTime(value)?.toJSDate() ?? null);
    }, [value]);

    return (
      <SelectPopover
        popoverWidth="target"
        {...props}
        popoverMaxHeight="fit-content"
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
          <PopoverContent className="select__dates-content min-h-[100px]">
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
          (({ ref, params, isOpen }) => (
            <RootSelectInput
              {...params}
              dynamicHeight={false}
              ref={ref}
              actions={actions}
              placeholder={placeholder}
              isOpen={isOpen}
              // isLoading={isLoading}
              isLocked={isLocked}
              size={size}
              isDisabled={isDisabled}
              className={inputClassName}
            >
              {v ? DateTime.fromJSDate(v).toFormat(formatString) : ""}
            </RootSelectInput>
          ))}
      </SelectPopover>
    );
  },
);

"use client";
import { forwardRef } from "react";

import { Checkbox as RootCheckbox, type CheckboxProps as RootCheckboxProps } from "@mantine/core";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

export interface CheckboxProps
  extends Pick<RootCheckboxProps, "readOnly" | "onChange">,
    ComponentProps {
  readonly value?: boolean;
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
  readonly label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { isDisabled = false, isLocked = false, value, label, ...props }: CheckboxProps,
    ref,
  ): JSX.Element =>
    label === undefined ? (
      <RootCheckbox
        {...props}
        ref={ref}
        checked={value}
        className={clsx(
          "checkbox",
          { disabled: isDisabled, "checkbox--locked": isLocked },
          props.className,
        )}
      />
    ) : (
      <div className="flex flex-row gap-[6px] items-center">
        <Checkbox value={value} isDisabled={isDisabled} isLocked={isLocked} {...props} />
        <Label size="sm" fontWeight="medium" className="leading-[16px]">
          {label}
        </Label>
      </div>
    ),
);

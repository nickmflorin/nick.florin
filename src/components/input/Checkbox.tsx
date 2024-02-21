"use client";
import { forwardRef } from "react";

import { Checkbox as RootCheckbox, type CheckboxProps as RootCheckboxProps } from "@mantine/core";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface CheckboxProps
  extends Pick<RootCheckboxProps, "readOnly" | "onChange">,
    ComponentProps {
  readonly value?: boolean;
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ isDisabled = false, isLocked = false, value, ...props }: CheckboxProps, ref): JSX.Element => (
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
  ),
);

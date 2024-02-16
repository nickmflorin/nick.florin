"use client";
import { Checkbox as RootCheckbox, type CheckboxProps as RootCheckboxProps } from "@mantine/core";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface CheckboxProps
  extends Pick<RootCheckboxProps, "readOnly" | "checked" | "onChange">,
    ComponentProps {
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
}

export const Checkbox = ({
  isDisabled = false,
  isLocked = false,
  ...props
}: CheckboxProps): JSX.Element => (
  <RootCheckbox
    {...props}
    className={clsx(
      "checkbox",
      { disabled: isDisabled, "checkbox--locked": isLocked },
      props.className,
    )}
  />
);

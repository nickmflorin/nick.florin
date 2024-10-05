"use client";
import { forwardRef, useState } from "react";

import { Checkbox as RootCheckbox, type CheckboxProps as RootCheckboxProps } from "@mantine/core";

import { classNames, parseDataAttributes } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography";

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
  ): JSX.Element => {
    const [isChecked, setIsChecked] = useState(false);

    if (label === undefined) {
      return (
        <RootCheckbox
          {...props}
          {...parseDataAttributes({isDisabled, isLocked})}
          ref={ref}
          checked={value === undefined ? isChecked : value}
          onClick={e => e.stopPropagation()}
          onChange={e => {
            setIsChecked(e.target.checked);
            props.onChange?.(e);
          }}
          className={classNames(
            "checkbox",
            props.className,
          )}
        />
      );
    }
    return (
      <div className="flex flex-row gap-[6px] items-center">
        <Checkbox value={value} isDisabled={isDisabled} isLocked={isLocked} {...props} />
        <Label fontSize="sm" fontWeight="medium" className="leading-[16px]">
          {label}
        </Label>
      </div>
    );
  },
);

export default Checkbox;

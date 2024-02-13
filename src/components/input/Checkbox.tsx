"use client";
import { Checkbox as RootCheckbox, type CheckboxProps as RootCheckboxProps } from "@mantine/core";

export interface CheckboxProps
  extends Pick<RootCheckboxProps, "readOnly" | "checked" | "onChange"> {}

export const Checkbox = (props: CheckboxProps): JSX.Element => (
  <RootCheckbox className="checkbox" {...props} />
);

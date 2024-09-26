import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import type * as types from "~/components/input/select/types";

import { BasicSelectInput, type BasicSelectInputProps } from "./BasicSelectInput";

export interface SelectInputProps<
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
> extends Omit<BasicSelectInputProps, "showPlaceholder" | "onClear"> {
  readonly value: types.SelectNullableValue<V, B> | types.NotSet;
  readonly onClear?: types.IfDeselectable<B, () => void>;
}

export const SelectInput = forwardRef<
  HTMLDivElement,
  SelectInputProps<types.AllowedSelectValue, types.SelectBehaviorType>
>(
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    { value, children, ...props }: SelectInputProps<V, B>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const showPlaceholder = useMemo(
      () => (Array.isArray(value) && value.length === 0) || value === null,
      [value],
    );

    return (
      <BasicSelectInput {...props} ref={ref} showPlaceholder={showPlaceholder}>
        {children}
      </BasicSelectInput>
    );
  },
) as {
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    props: SelectInputProps<V, B> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};

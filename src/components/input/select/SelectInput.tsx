import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import type * as types from "~/components/input/select/types";

import {
  RootSelectInput,
  type RootSelectInputInstance,
  type RootSelectInputProps,
} from "./RootSelectInput";

export interface SelectInputProps<
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
> extends Omit<RootSelectInputProps, "showPlaceholder" | "onClear"> {
  readonly value: types.SelectNullableValue<{ value: V; behavior: B }> | types.NotSet;
  readonly onClear?: types.IfClearable<{ behavior: B }, (() => void) | undefined>;
}

export const SelectInput = forwardRef<
  RootSelectInputInstance,
  SelectInputProps<types.AllowedSelectValue, types.SelectBehaviorType>
>(
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    { value, children, ...props }: SelectInputProps<V, B>,
    ref: ForwardedRef<RootSelectInputInstance>,
  ) => {
    const showPlaceholder = useMemo(
      () => (Array.isArray(value) && value.length === 0) || value === null,
      [value],
    );

    return (
      <RootSelectInput {...props} ref={ref} showPlaceholder={showPlaceholder}>
        {children}
      </RootSelectInput>
    );
  },
) as {
  <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>(
    props: SelectInputProps<V, B> & { readonly ref?: ForwardedRef<RootSelectInputInstance> },
  ): JSX.Element;
};

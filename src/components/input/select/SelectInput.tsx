import { type ForwardedRef, type JSX, useMemo } from 'react';

import type * as types from '~/components/input/select/types';

import {
  RootSelectInput,
  type RootSelectInputInstance,
  type RootSelectInputProps,
} from './RootSelectInput';

export interface SelectInputProps<
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
> extends Omit<RootSelectInputProps, 'isPlaceholderVisible' | 'onClear'> {
  readonly onClear?: types.IfClearable<{ behavior: B }, (() => void) | undefined>;
  readonly value: types.NotSet | types.SelectNullableValue<{ behavior: B; value: V }>;
}

export const SelectInput = <
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
>({
  children,
  ref,
  value,
  ...props
}: {
  readonly ref?: ForwardedRef<RootSelectInputInstance>;
} & SelectInputProps<V, B>): JSX.Element => {
  const showPlaceholder = useMemo(
    () => (Array.isArray(value) && value.length === 0) || value === null,
    [value],
  );

  return (
    <RootSelectInput {...props} isPlaceholderVisible={showPlaceholder} ref={ref}>
      {children}
    </RootSelectInput>
  );
};

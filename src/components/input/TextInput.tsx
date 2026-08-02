import { type ForwardedRef } from 'react';

import { omit, pick } from 'lodash-es';

import { classNames } from '~/components/types';

import { Input, type InputProps, NativeInput, type NativeInputProps } from './generic';

export interface TextInputProps
  extends
    Omit<InputProps, 'children' | 'hasDynamicHeight' | 'placeholder' | 'ref'>,
    Omit<NativeInputProps, 'value' | keyof InputProps> {
  readonly placeholder?: string;
  readonly ref?: ForwardedRef<HTMLInputElement>;
  readonly value?: string;
}

const INPUT_PROPS = [
  'className',
  'style',
  'variant',
  'size',
  'onFocus',
  'onBlur',
  'onPointerDown',
  'onMouseDown',
  'onClick',
  'onKeyDown',
  'onKeyUp',
  'onFocusCapture',
  'actions',
  'isActive',
  'isLocked',
  'isLoading',
  'isReadOnly',
  'radius',
  'icon',
  'isClearVisible',
  'isClearDisabled',
  'onClear',
  'clearIcon',
  'shouldReserveSpaceForLoadingIndicator',
] as const;

export const TextInput = ({ isDisabled, ref, ...props }: TextInputProps) => (
  <Input
    {...pick(props, INPUT_PROPS)}
    className={classNames('text-input', props.className)}
    hasDynamicHeight={false}
    isDisabled={isDisabled}
  >
    <NativeInput {...omit(props, INPUT_PROPS)} isDisabled={isDisabled} ref={ref} />
  </Input>
);

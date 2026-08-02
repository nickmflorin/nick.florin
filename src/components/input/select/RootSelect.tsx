'use client';
import { type JSX, type ReactNode, type Ref, useImperativeHandle, useRef, useState } from 'react';

import { type Optional } from 'utility-types';

import { type FloatingContentRenderProps } from '~/components/floating';
import type * as types from '~/components/input/select/types';
import { type ComponentProps } from '~/components/types';

import {
  RootSelectInput,
  type RootSelectInputInstance,
  type RootSelectInputProps,
} from './RootSelectInput';
import {
  omitSelectPopoverProps,
  pickSelectPopoverProps,
  SelectPopover,
  type SelectPopoverInstance,
  type SelectPopoverProps,
} from './SelectPopover';
import { SelectPopoverContent } from './SelectPopoverContent';

export interface RootSelectProps
  extends
    Omit<Optional<SelectPopoverProps, 'children'>, 'content' | 'isLoading'>,
    Omit<
      RootSelectInputProps,
      'children' | 'isLoading' | 'isOpen' | 'value' | keyof ComponentProps
    > {
  readonly content:
    | ((params: Pick<FloatingContentRenderProps, 'isOpen' | 'setIsOpen'>) => JSX.Element | null)
    | JSX.Element;
  readonly inputClassName?: ComponentProps['className'];
  readonly isInputLoading?: boolean;
  readonly isPopoverLoading?: boolean;
  readonly popoverClassName?: ComponentProps['className'];
  readonly ref?: Ref<types.RootSelectInstance>;
  readonly renderedValue?: ReactNode;
}

export const RootSelect = ({
  children,
  content,
  hasDynamicHeight = true,
  inputClassName,
  isInPortal,
  isInputLoading,
  isPopoverLoading: _propPopoverIsLoading,
  popoverClassName,
  ref,
  renderedValue,
  ...props
}: RootSelectProps): JSX.Element => {
  const [internalPopoverIsLoading, setInternalPopoverIsLoading] = useState(false);

  const popoverRef = useRef<null | SelectPopoverInstance>(null);
  const inputRef = useRef<null | RootSelectInputInstance>(null);

  const isPopoverLoading = (_propPopoverIsLoading ?? false) || internalPopoverIsLoading;

  useImperativeHandle(ref, () => ({
    focusInput: () => inputRef.current?.focus(),
    setInputLoading: (v: boolean) => inputRef.current?.setLoading(v),
    setOpen: (v: boolean) => popoverRef.current?.setOpen(v),
    setPopoverLoading: (v: boolean) => setInternalPopoverIsLoading(v),
  }));

  return (
    <SelectPopover
      {...pickSelectPopoverProps(props)}
      content={({ isOpen, params, ref: _ref, setIsOpen, styles }) => (
        <SelectPopoverContent
          {...params}
          className={popoverClassName}
          isInPortal={isInPortal}
          isLoading={isPopoverLoading}
          ref={_ref}
          style={styles}
        >
          {typeof content === 'function' ? content({ isOpen, setIsOpen }) : content}
        </SelectPopoverContent>
      )}
      isInPortal={isInPortal}
      ref={popoverRef}
    >
      {children ??
        (({ isOpen, params, ref: _ref }) => (
          <RootSelectInput
            {...params}
            {...omitSelectPopoverProps(props)}
            className={inputClassName}
            hasDynamicHeight={hasDynamicHeight}
            isLoading={isInputLoading}
            isOpen={isOpen}
            ref={instance => {
              _ref(instance);
              if (instance) {
                inputRef.current = instance;
              }
            }}
          >
            {renderedValue}
          </RootSelectInput>
        ))}
    </SelectPopover>
  );
};

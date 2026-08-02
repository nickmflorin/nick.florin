'use client';
import dynamic from 'next/dynamic';
import { type JSX, type Ref, useRef } from 'react';

import { DateTime } from 'luxon';
import { type Optional } from 'utility-types';

import { PopoverContent } from '~/components/floating/PopoverContent';
import { Loading } from '~/components/loading/Loading';
import { type ComponentProps } from '~/components/types';

import { RootSelectInput, type RootSelectInputProps } from '../select/RootSelectInput';
import {
  SelectPopover,
  type SelectPopoverInstance,
  type SelectPopoverProps,
} from '../select/SelectPopover';

import { toDateTime } from './util';

const DatePicker = dynamic(() => import('./DatePicker').then(mod => mod.DatePicker), {
  loading: () => <Loading isLoading />,
});

export interface DateSelectProps
  extends
    Optional<Omit<SelectPopoverProps, 'content' | 'isReady' | 'ref'>, 'children'>,
    Omit<
      RootSelectInputProps,
      'children' | 'hasDynamicHeight' | 'isOpen' | 'isPlaceholderVisible' | 'ref'
    > {
  readonly formatString?: string;
  readonly inputClassName?: ComponentProps['className'];
  readonly onChange?: (v: Date | null) => void;
  readonly ref?: Ref<SelectPopoverInstance>;
  readonly shouldCloseMenuOnSelect?: boolean;
  readonly value: Date | null | string;
}

export const DateSelect = ({
  actions,
  children,
  formatString = 'yyyy-MM-dd',
  inputClassName,
  isDisabled,
  isLocked,
  onChange,
  placeholder,
  ref,
  shouldCloseMenuOnSelect = true,
  size,
  value,
  ...props
}: DateSelectProps): JSX.Element => {
  const internalInstance = useRef<null | SelectPopoverInstance>(null);

  const selected = toDateTime(value)?.toJSDate() ?? null;

  return (
    <SelectPopover
      popoverWidth='target'
      {...props}
      content={
        <PopoverContent className='select__dates-content min-h-[100px]'>
          <DatePicker
            onChange={dt => {
              onChange?.(dt);
              if (shouldCloseMenuOnSelect) {
                internalInstance.current?.setOpen(false);
              }
            }}
            value={value}
          />
        </PopoverContent>
      }
      popoverMaxHeight='fit-content'
      ref={instance => {
        if (instance) {
          internalInstance.current = instance;
          if (typeof ref === 'function') {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }
      }}
    >
      {children ??
        (({ isOpen, params, ref: inputRef }) => (
          <RootSelectInput
            {...params}
            actions={actions}
            className={inputClassName}
            hasDynamicHeight={false}
            isDisabled={isDisabled}
            // isLoading={isLoading}
            isLocked={isLocked}
            isOpen={isOpen}
            placeholder={placeholder}
            ref={inputRef}
            size={size}
          >
            {selected ? DateTime.fromJSDate(selected).toFormat(formatString) : ''}
          </RootSelectInput>
        ))}
    </SelectPopover>
  );
};

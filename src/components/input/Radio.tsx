'use client';

import { type Ref, useRef } from 'react';

import { Radio as RootRadio, type RadioProps as RootRadioProps } from '@mantine/core';

import { classNames, type ComponentProps } from '~/components/types';
import { Label } from '~/components/typography';

export interface RadioProps
  extends
    ComponentProps,
    Omit<RootRadioProps, 'children' | 'className' | 'onChange' | 'onClick' | 'style'> {
  readonly children?: string;
  readonly onClick?: (checked: boolean) => void;
  readonly ref?: Ref<HTMLDivElement>;
}

export const Radio = ({
  children,
  className,
  onClick,
  ref: rootRef,
  style,
  ...props
}: RadioProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const toggle = () => {
    if (ref.current) {
      const input = ref.current.querySelector('input[type="radio"]');
      if (input && input instanceof HTMLInputElement) {
        onClick?.(input.checked);
      }
    }
  };

  if (children) {
    return (
      <div
        aria-checked={props.checked}
        className={classNames('flex flex-row gap-[4px] h-[20px]', className)}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        role='radio'
        style={style}
        tabIndex={0}
      >
        <Radio
          readOnly
          ref={instance => {
            ref.current = instance;
            if (typeof rootRef === 'function') {
              rootRef(instance);
            } else if (rootRef) {
              rootRef.current = instance;
            }
          }}
          {...props}
          tabIndex={-1}
        />
        <Label className='leading-[20px]' fontSize='sm' fontWeight='medium'>
          {children}
        </Label>
      </div>
    );
  }
  return <RootRadio {...props} className='radio' rootRef={rootRef} />;
};

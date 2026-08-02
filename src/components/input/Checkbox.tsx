'use client';
import { type JSX, type Ref, useState } from 'react';

import { Checkbox as RootCheckbox, type CheckboxProps as RootCheckboxProps } from '@mantine/core';

import {
  classNames,
  type ComponentProps,
  parseDataAttributes,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';
import { Label } from '~/components/typography';

export interface CheckboxProps
  extends Pick<RootCheckboxProps, 'onChange' | 'readOnly'>, ComponentProps {
  readonly isChecked?: boolean;
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
  readonly label?: string;
  readonly ref?: Ref<HTMLInputElement>;
  readonly size?: QuantitativeSize<'px'>;
}

export const Checkbox = ({
  isChecked,
  isDisabled = false,
  isLocked = false,
  label,
  ref,
  size,
  ...props
}: CheckboxProps): JSX.Element => {
  const [isInternallyChecked, setIsInternallyChecked] = useState(false);

  if (label === undefined) {
    return (
      <RootCheckbox
        {...props}
        {...parseDataAttributes({ isDisabled, isLocked })}
        checked={isChecked ?? isInternallyChecked}
        className={classNames('checkbox', props.className)}
        onChange={e => {
          setIsInternallyChecked(e.target.checked);
          props.onChange?.(e);
        }}
        onClick={e => e.stopPropagation()}
        ref={ref}
        style={{
          ...props.style,
          height: size === undefined ? props.style?.height : sizeToString(size, 'px'),
          width: size === undefined ? props.style?.width : sizeToString(size, 'px'),
        }}
      />
    );
  }
  return (
    <div className='flex flex-row gap-[6px] items-center'>
      <Checkbox isChecked={isChecked} isDisabled={isDisabled} isLocked={isLocked} {...props} />
      <Label className='leading-[16px]' fontSize='sm' fontWeight='medium'>
        {label}
      </Label>
    </div>
  );
};

import { type ForwardedRef, type JSX } from 'react';

import { classNames } from '~/components/types';

import { IconButton, type IconButtonProps } from './generic';

export interface ClearButtonProps extends Omit<
  IconButtonProps<'button'>,
  'element' | 'icon' | 'iconSize' | 'options' | 'size'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const ClearButton = ({ ref, ...props }: ClearButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    className={classNames('text-gray-500 disabled:text-gray-200', props.className)}
    element='button'
    icon={{ iconStyle: 'solid', name: 'circle-xmark' }}
    iconSize='16px'
    ref={ref}
    size='xsmall'
  />
);

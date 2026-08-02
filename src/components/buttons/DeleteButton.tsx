import { type ForwardedRef } from 'react';

import { classNames } from '~/components/types';

import { IconButton, type IconButtonProps } from './generic';

export interface DeleteButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const DeleteButton = ({ ref, ...props }: DeleteButtonProps) => (
  <IconButton.Transparent
    {...props}
    className={classNames('text-red-600 hover:text-red-700 hover:bg-transparent', props.className)}
    disabledClassName='text-disabled hover:text-disabled hover:bg-transparent'
    icon='trash-alt'
    ref={ref}
  />
);

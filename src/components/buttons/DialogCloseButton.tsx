import { type ForwardedRef, type JSX } from 'react';

import { classNames } from '~/components/types';

import { IconButton, type IconButtonProps } from './generic';

export interface DialogCloseButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'iconSize' | 'options' | 'size'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const DialogCloseButton = ({ ref, ...props }: DialogCloseButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    className={classNames('dialog__close-button', props.className)}
    element='button'
    icon={{ iconStyle: 'solid', name: 'xmark' }}
    iconSize='large'
    ref={ref}
    scheme='light'
    size='xsmall'
  />
);

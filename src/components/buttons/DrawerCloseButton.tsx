import { type JSX } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface DrawerCloseButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'iconSize' | 'options' | 'size'
> {}

export const DrawerCloseButton = (props: DrawerCloseButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    element='button'
    icon={{ iconStyle: 'solid', name: 'xmark' }}
    iconSize='large'
    scheme='light'
    size='xsmall'
  />
);

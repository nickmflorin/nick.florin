import { type ForwardedRef, type JSX } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface EllipsisButtonProps extends Omit<IconButtonProps<'button'>, 'icon' | 'options'> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const EllipsisButton = ({ ref, ...props }: EllipsisButtonProps): JSX.Element => (
  <IconButton.Solid
    {...props}
    element='button'
    icon={{ name: 'ellipsis-h' }}
    ref={ref}
    scheme='secondary'
  />
);

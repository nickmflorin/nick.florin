import { type JSX, type Ref } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface ChartFilterButtonProps extends Omit<
  IconButtonProps<'button'>,
  'element' | 'icon' | 'options' | 'ref'
> {
  readonly ref?: Ref<HTMLButtonElement>;
}

export const ChartFilterButton = ({ ref, ...props }: ChartFilterButtonProps): JSX.Element => (
  <IconButton.Solid
    scheme='secondary'
    size='medium'
    {...props}
    element='button'
    icon={{ name: 'sliders' }}
    ref={ref}
  />
);

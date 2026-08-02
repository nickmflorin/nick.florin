import { type JSX } from 'react';

import { classNames } from '~/components/types';

import { IconButton, type IconButtonProps } from './generic';

export interface SocialButtonProps extends Omit<IconButtonProps<'a'>, 'iconSize' | 'options'> {}

export const SocialButton = (props: SocialButtonProps): JSX.Element => (
  <IconButton.Transparent
    {...props}
    className={classNames('h-[22px] w-[22px] min-h-[22px] text-gray-500', props.className)}
    element='a'
    iconSize='full'
    size='22px'
  />
);

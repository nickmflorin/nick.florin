import { type JSX } from 'react';

import { classNames } from '~/components/types';

import { Icon } from './Icon';
import { CircleNotch } from './svgs/CircleNotch';
import { type SpinnerProps } from './types';

export const Spinner = ({ isLoading, ...props }: SpinnerProps): JSX.Element | null =>
  isLoading === true ? (
    <Icon {...props} className={classNames('spinner', props.className)}>
      <CircleNotch />
    </Icon>
  ) : null;

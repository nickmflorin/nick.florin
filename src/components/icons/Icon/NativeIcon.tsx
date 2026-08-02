import { type ReactNode, type Ref } from 'react';

import { pick } from 'lodash-es';

import { IconDiscreteSizes, type IconProps } from '~/components/icons/types';
import { classNames, parseDataAttributes } from '~/components/types';

import { getNativeIconStyle } from './util';

export type NativeIconProps = {
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
} & Pick<IconProps, 'className' | 'dimension' | 'fit' | 'isDisabled' | 'size' | 'style'>;

export const NativeIcon = ({ ref, ...props }: NativeIconProps) => (
  <i
    ref={ref}
    {...parseDataAttributes({
      ...pick(props, ['fit', 'dimension', 'isDisabled'] as const),
      size: IconDiscreteSizes.contains(props.size) ? props.size : undefined,
    })}
    className={classNames('icon', props.className)}
    style={{ ...props.style, ...getNativeIconStyle(props) }}
  >
    {props.children}
  </i>
);

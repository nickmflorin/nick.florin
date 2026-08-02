import {
  View,
  type ViewFillProps,
  type ViewPositionProps,
  type ViewSizeProps,
} from '~/components/structural/View';
import { classNames, type ComponentProps } from '~/components/types';

import { EmptyMessage, type EmptyMessageProps } from './EmptyMessage';

export interface EmptyViewProps
  extends
    ComponentProps,
    ViewSizeProps,
    ViewPositionProps,
    ViewFillProps,
    Omit<EmptyMessageProps, keyof ComponentProps> {}

export const EmptyView = ({ children, fill = 'parent', ...props }: EmptyViewProps) => (
  <View
    {...props}
    __default_position__='relative'
    centerChildren
    className={classNames('p-2', props.className)}
    fill={fill}
    overflow='hidden'
  >
    <EmptyMessage {...props}>{children}</EmptyMessage>
  </View>
);

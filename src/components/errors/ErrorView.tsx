import {
  View,
  type ViewFillProps,
  type ViewPositionProps,
  type ViewSizeProps,
} from '~/components/structural/View';
import { classNames, type ComponentProps } from '~/components/types';

import { ErrorDetail, type ErrorDetailProps } from './ErrorDetail';

export interface ErrorViewProps
  extends
    ComponentProps,
    ViewSizeProps,
    ViewPositionProps,
    ViewFillProps,
    Omit<ErrorDetailProps, keyof ComponentProps> {}

export const ErrorView = ({ children, fill = 'parent', ...props }: ErrorViewProps) => (
  <View
    {...props}
    __default_position__='relative'
    centerChildren
    className={classNames('p-2', props.className)}
    fill={fill}
    overflow='hidden'
  >
    <ErrorDetail {...props}>{children}</ErrorDetail>
  </View>
);

import { type SpinnerProps } from '~/components/icons';
import { Spinner } from '~/components/icons/Spinner';
import { View, type ViewComponent, type ViewProps } from '~/components/structural/View';
import { classNames, type ComponentProps, parseDataAttributes } from '~/components/types';

/**
 * The class name applied to the loading view while the spinner is displayed, so that the spinner
 * appears above the content and the content's scroll behavior is prevented, but only while the
 * spinner is present.
 */
const LoadingViewActiveClassName = 'z-10';

export interface LoadingViewProps<C extends ViewComponent> extends Pick<
  ViewProps<C>,
  'component' | 'dim' | 'fill' | 'fillScreen' | 'isDisabled' | 'position' | keyof ComponentProps
> {
  readonly isLoading?: boolean;
  readonly spinnerProps?: Omit<SpinnerProps, 'isLoading' | 'size'>;
  readonly spinnerSize?: SpinnerProps['size'];
}

export const LoadingView = <C extends ViewComponent>({
  fill = 'parent',
  fillScreen,
  isLoading,
  spinnerProps,
  spinnerSize = '24px',
  ...props
}: LoadingViewProps<C>) => (
  <View
    {...props}
    {...parseDataAttributes({ isLoading, loadingView: true })}
    __default_position__='absolute'
    centerChildren
    className={classNames({ [LoadingViewActiveClassName]: isLoading }, props.className)}
    fill={fillScreen ? 'screen' : fill}
    overflow='hidden'
  >
    <Spinner {...spinnerProps} isLoading={isLoading} size={spinnerSize} />
  </View>
);

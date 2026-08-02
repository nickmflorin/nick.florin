import { type JSX, type ReactNode } from 'react';

import { type ApiError } from '~/api';

import { type SpinnerProps } from '~/components/icons';

import { State } from './State';

export interface ApiResponseViewProps<T> {
  readonly areChildrenHiddenOnError?: boolean;
  readonly children: ((data: T) => ReactNode) | ReactNode;
  readonly data?: T;
  readonly error?: ApiError | null | string;
  readonly isInitialLoading?: boolean;
  readonly isLoading?: boolean;
  readonly skeleton?: JSX.Element;
  readonly spinnerSize?: Exclude<SpinnerProps['size'], 'full'>;
}

export const ApiResponseState = <T,>({
  areChildrenHiddenOnError = true,
  children,
  data,
  error,
  isInitialLoading,
  isLoading,
  skeleton,
  spinnerSize,
}: ApiResponseViewProps<T>): JSX.Element => (
  <State
    areChildrenHiddenOnError={areChildrenHiddenOnError}
    error={error}
    isLoading={isLoading}
    loadingProps={{ spinnerSize }}
  >
    {isInitialLoading
      ? skeleton
      : typeof children === 'function'
        ? data
          ? children(data)
          : null
        : children}
  </State>
);

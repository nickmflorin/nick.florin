import { type ReactNode } from 'react';

import { type ErrorType } from './errors';
import { Error } from './errors/Error';
import { Loading, type LoadingProps } from './loading/Loading';

export interface StateProps {
  readonly areChildrenHiddenOnError?: boolean;
  readonly children: ReactNode;
  readonly error?: ErrorType;
  readonly isLoading?: boolean;
  readonly loadingProps?: LoadingProps<'div'>;
}

export const State = ({
  areChildrenHiddenOnError,
  children,
  error,
  isLoading,
  loadingProps,
}: StateProps) => (
  <Loading isLoading={isLoading} {...loadingProps}>
    <Error areChildrenHiddenOnError={areChildrenHiddenOnError} error={error}>
      {children}
    </Error>
  </Loading>
);

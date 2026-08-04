import { type JSX, type ReactNode } from 'react';

import { ShowHide } from '~/components/util';

import { ErrorView, type ErrorViewProps } from './ErrorView';

export interface ErrorProps extends ErrorViewProps {
  readonly areChildrenHiddenOnError?: boolean;
  readonly message?: ReactNode | ReactNode[];
}

export const Error = ({
  areChildrenHiddenOnError = true,
  children,
  error,
  message,
  ...props
}: ErrorProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={error === undefined ? false : error !== null}>
          <ErrorView {...props} error={error}>
            {message}
          </ErrorView>
        </ShowHide>
        <ShowHide hide={error !== undefined && error !== null ? areChildrenHiddenOnError : false}>
          {children}
        </ShowHide>
      </>
    );
  }
  return (
    <ShowHide show={error === undefined ? false : error !== null}>
      <ErrorView {...props} error={error}>
        {message}
      </ErrorView>
    </ShowHide>
  );
};

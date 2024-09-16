import type { ReactNode } from "react";

import { ShowHide } from "~/components/util";

import { ErrorView, type ErrorViewProps } from "./ErrorView";

export interface ErrorProps extends ErrorViewProps {
  readonly hideChildrenOnError?: boolean;
  readonly message?: ReactNode | ReactNode[];
}

export const Error = ({
  error,
  hideChildrenOnError = true,
  children,
  message,
  ...props
}: ErrorProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={error !== undefined && error !== null}>
          <ErrorView {...props} error={error}>
            {message}
          </ErrorView>
        </ShowHide>
        <ShowHide hide={error !== undefined && error !== null && hideChildrenOnError}>
          {children}
        </ShowHide>
      </>
    );
  }
  return (
    <ShowHide show={error !== undefined && error !== null}>
      <ErrorView {...props} error={error}>
        {message}
      </ErrorView>
    </ShowHide>
  );
};

import { type ReactNode } from "react";

import { Error } from "./errors";
import { Loading, type LoadingProps } from "./Loading";
import { type ErrorType } from "./types";

export interface StateProps {
  readonly isLoading?: boolean;
  readonly loadingProps?: LoadingProps;
  readonly isError?: boolean;
  readonly error?: ErrorType;
  readonly children: ReactNode;
  readonly hideChildrenOnError?: boolean;
}

export const State = ({
  children,
  isLoading,
  hideChildrenOnError,
  loadingProps,
  error,
  isError,
}: StateProps) => (
  <Loading isLoading={isLoading} {...loadingProps}>
    <Error isError={isError} error={error} hideChildrenOnError={hideChildrenOnError}>
      {children}
    </Error>
  </Loading>
);

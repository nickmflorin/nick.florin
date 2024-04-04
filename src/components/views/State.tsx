import { type ReactNode } from "react";

import { Error, type ErrorType } from "./error";
import { Loading, type LoadingProps } from "./Loading";

export interface StateProps {
  readonly isLoading?: boolean;
  readonly loadingProps?: LoadingProps;
  readonly isError?: boolean;
  readonly error?: ErrorType;
  readonly children: ReactNode;
}

export const State = ({ children, isLoading, loadingProps, error, isError }: StateProps) => (
  <Loading isLoading={isLoading} {...loadingProps}>
    <Error isError={isError} error={error}>
      {children}
    </Error>
  </Loading>
);

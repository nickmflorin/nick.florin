import { type ReactNode } from "react";

import { type ErrorType } from "./errors";
import { Error } from "./errors/Error";
import { Loading, type LoadingProps } from "./loading/Loading";

export interface StateProps {
  readonly isLoading?: boolean;
  readonly loadingProps?: LoadingProps<"div">;
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
}: StateProps) => (
  <Loading isLoading={isLoading} {...loadingProps}>
    <Error error={error} hideChildrenOnError={hideChildrenOnError}>
      {children}
    </Error>
  </Loading>
);

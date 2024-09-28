import { type ReactNode } from "react";

import { type HttpError } from "~/api";
import { type ApiError } from "~/api-v2";

import { type SpinnerProps } from "~/components/icons";

import { State } from "./State";

export interface ApiResponseViewProps<T> {
  readonly error?: string | null | HttpError | ApiError;
  readonly isLoading?: boolean;
  readonly isInitialLoading?: boolean;
  readonly data?: T;
  readonly skeleton?: JSX.Element;
  readonly hideChildrenOnError?: boolean;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
  readonly children: ReactNode | ((data: T) => ReactNode);
}

export const ApiResponseState = <T,>({
  error,
  isLoading,
  spinnerSize,
  data,
  isInitialLoading,
  hideChildrenOnError = true,
  skeleton,
  children,
}: ApiResponseViewProps<T>): JSX.Element => (
  <State
    isLoading={isLoading}
    error={error}
    hideChildrenOnError={hideChildrenOnError}
    loadingProps={{ spinnerSize }}
  >
    {isInitialLoading ? (
      skeleton
    ) : typeof children === "function" ? (
      data ? (
        children(data)
      ) : (
        <></>
      )
    ) : (
      children
    )}
  </State>
);

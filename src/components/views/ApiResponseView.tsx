import { type ReactNode } from "react";

import { isHttpError, type HttpError } from "~/api";
import { type SpinnerProps } from "~/components/icons";

import { ErrorView } from "./ErrorView";
import { Loading } from "./Loading";

export interface ApiResponseViewProps<T> {
  readonly error?: JSX.Element | string | null | HttpError;
  readonly isLoading: boolean;
  readonly data?: T;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
  readonly children: (data: T) => ReactNode;
}

export const ApiResponseView = <T,>({
  error,
  isLoading,
  spinnerSize,
  data,
  children,
}: ApiResponseViewProps<T>): JSX.Element => (
  <Loading
    dimmed={data !== undefined}
    overlay={data !== undefined}
    spinnerSize={spinnerSize}
    loading={isLoading}
    spinner
  >
    {error ? (
      typeof error === "string" || error === null || isHttpError(error) ? (
        <ErrorView error={error} />
      ) : (
        <ErrorView>{error}</ErrorView>
      )
    ) : data ? (
      children(data)
    ) : (
      <></>
    )}
  </Loading>
);

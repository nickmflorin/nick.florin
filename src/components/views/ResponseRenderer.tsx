import { type ReactNode } from "react";

import { type HttpError } from "~/application/errors";
import { type SpinnerProps } from "~/components/icons";

import { Error } from "./Error";
import { Loading } from "./Loading";

export interface ResponseRendererProps<T> {
  readonly error?: JSX.Element | string | null | HttpError;
  readonly isLoading: boolean;
  readonly data?: T;
  readonly hideWhenLoading?: boolean;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
  readonly children: (data: T) => ReactNode;
}

export const ResponseRenderer = <T,>({
  error,
  isLoading,
  spinnerSize,
  data,
  children,
}: ResponseRendererProps<T>): JSX.Element => {
  if (error) {
    return <Error error={error} />;
  } else if (isLoading) {
    if (data) {
      return (
        <Loading spinnerSize={spinnerSize} loading={true}>
          {children(data)}
        </Loading>
      );
    }
    return <Loading spinnerSize={spinnerSize} loading={true} />;
  } else if (data) {
    return <>{children(data)}</>;
  }
  return <></>;
};

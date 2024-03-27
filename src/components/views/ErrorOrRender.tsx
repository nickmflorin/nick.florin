import React, { type ReactNode } from "react";

import { type HttpError } from "~/http";

import { ErrorView, type ErrorViewProps } from "./ErrorView";

export interface ErrorOrRenderProps extends Omit<ErrorViewProps, "children" | "error"> {
  readonly error: JSX.Element | string | null | HttpError | undefined;
  readonly children: ReactNode;
}

export const ErrorOrRender = ({
  error,
  overlay = true,
  children,
  ...props
}: ErrorOrRenderProps): JSX.Element => {
  if (children) {
    return error ? <ErrorView {...props} error={error} /> : <>{children}</>;
  } else if (error !== undefined && error !== null) {
    return <ErrorView {...props} error={error} overlay={overlay} />;
  }
  return <></>;
};

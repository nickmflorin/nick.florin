import React, { type ReactNode } from "react";

import { ShowHide } from "~/components/util";

import { LoadingView, type LoadingViewProps } from "./LoadingView";

export interface LoadingProps extends Omit<LoadingViewProps, "isDisabled" | "dim"> {
  readonly children?: ReactNode;
}

export const Loading = ({ isLoading = false, children, ...props }: LoadingProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={isLoading}>
          <LoadingView {...props} isLoading={isLoading} />
        </ShowHide>
        {children}
      </>
    );
  }
  return (
    <ShowHide show={isLoading}>
      <LoadingView {...props} isLoading={isLoading} />
    </ShowHide>
  );
};

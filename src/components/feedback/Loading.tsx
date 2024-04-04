import React, { type ReactNode } from "react";

import { ShowHide } from "~/components/util";
import { LoadingView, type LoadingViewProps } from "~/components/views/LoadingView";

export interface LoadingProps extends LoadingViewProps {
  readonly children?: ReactNode;
}

export const Loading = ({ isLoading = false, children, ...props }: LoadingProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide
          show={isLoading === true || [props.blurred, props.dimmed, props.overlay].includes(true)}
        >
          <LoadingView {...props} isLoading={isLoading} />
        </ShowHide>
        {children}
      </>
    );
  }
  return (
    <ShowHide
      show={isLoading === true || [props.blurred, props.dimmed, props.overlay].includes(true)}
    >
      <LoadingView {...props} isLoading={isLoading} />
    </ShowHide>
  );
};

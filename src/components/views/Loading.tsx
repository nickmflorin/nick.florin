import React from "react";

import clsx from "clsx";

import { type SpinnerProps } from "~/components/icons";
import { Spinner } from "~/components/icons/Spinner";
import { ShowHide } from "~/components/util";
import { View, type ViewProps } from "~/components/views/View";

export interface LoadingProps extends ViewProps {
  readonly loading?: boolean;
  readonly hideWhenLoading?: boolean;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
}

const _WrappedSpinner = ({
  spinnerSize = "24px",
  dimmed = true,
  ...props
}: Omit<LoadingProps, "loading" | "children" | "hideWhenLoading">) => (
  <View
    {...props}
    dimmed={dimmed}
    className={clsx("loading border border-gray-100", props.className)}
  >
    <Spinner size={spinnerSize} isLoading={true} />
  </View>
);

const WrappedSpinner = React.memo(_WrappedSpinner);

export const _Loading = ({
  loading,
  hideWhenLoading = false,
  children,
  ...props
}: LoadingProps): JSX.Element => {
  if (children) {
    if (hideWhenLoading === true) {
      return loading === true ? <WrappedSpinner {...props} /> : <>{children}</>;
    }
    return (
      <>
        <ShowHide show={loading === true}>
          <WrappedSpinner {...props} />
        </ShowHide>
        {children}
      </>
    );
  }
  return loading === true ? <WrappedSpinner {...props} /> : <></>;
};

export const Loading = React.memo(_Loading);

import React from "react";

import clsx from "clsx";

import { type SpinnerProps } from "~/components/icons";
import { Spinner } from "~/components/icons/Spinner";
import { ShowHide } from "~/components/util";
import { View, type ViewProps } from "~/components/views/View";

export interface LoadingProps extends ViewProps {
  readonly loading?: boolean;
  readonly hideWhenLoading?: boolean;
  readonly spinner?: boolean;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
}

const _WrappedSpinner = ({
  spinnerSize = "24px",
  spinner = true,
  loading,
  ...props
}: Omit<LoadingProps, "children" | "hideWhenLoading">) => (
  <View
    {...props}
    className={clsx(
      "loading",
      {
        "z-20": loading,
        "z-0": !loading && [props.blurred, props.dimmed, props.overlay].includes(true),
      },
      { "is-loading": loading },
      props.className,
    )}
  >
    {spinner && loading ? <Spinner size={spinnerSize} isLoading={true} /> : <></>}
  </View>
);

const WrappedSpinner = React.memo(_WrappedSpinner);

export const _Loading = ({
  loading = false,
  hideWhenLoading = false,
  children,
  ...props
}: LoadingProps): JSX.Element => {
  if (children) {
    if (hideWhenLoading === true) {
      return loading === true ? <WrappedSpinner {...props} loading={loading} /> : <>{children}</>;
    }
    return (
      <>
        <ShowHide
          show={loading === true || [props.blurred, props.dimmed, props.overlay].includes(true)}
        >
          <WrappedSpinner {...props} loading={loading} />
        </ShowHide>
        {children}
      </>
    );
  }
  return loading === true || [props.blurred, props.dimmed, props.overlay].includes(true) ? (
    <WrappedSpinner {...props} loading={loading} />
  ) : (
    <></>
  );
};

export const Loading = React.memo(_Loading);

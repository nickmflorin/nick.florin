import React from "react";

import clsx from "clsx";

import { type SpinnerProps } from "~/components/icons";
import { Spinner } from "~/components/icons/Spinner";
import { ShowHide } from "~/components/util";
import { View, type ViewProps } from "~/components/views/View";

export interface LoadingProps extends ViewProps {
  readonly isLoading?: boolean;
  readonly hideWhenLoading?: boolean;
  readonly spinner?: boolean;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
}

const _WrappedSpinner = ({
  spinnerSize = "24px",
  spinner = true,
  isLoading,
  ...props
}: Omit<LoadingProps, "children" | "hideWhenLoading">) => (
  <View
    {...props}
    className={clsx(
      "loading",
      {
        /* If the spinner is being displayed, the view needs to have a higher z-index than it other
           wise would.  This is such that the spinner appears over the content.  This will prevent
           scroll behavior on the content, but only when the spinner is present. */
        "z-50": isLoading && spinner,
        "z-20": isLoading,
        "z-0": !isLoading && [props.blurred, props.dimmed, props.overlay].includes(true),
      },
      { "is-loading": isLoading },
      props.className,
    )}
  >
    {spinner && isLoading ? <Spinner size={spinnerSize} isLoading={true} /> : <></>}
  </View>
);

const WrappedSpinner = React.memo(_WrappedSpinner);

export const _Loading = ({
  isLoading = false,
  hideWhenLoading = false,
  children,
  ...props
}: LoadingProps): JSX.Element => {
  if (children) {
    if (hideWhenLoading === true) {
      return isLoading === true ? (
        <WrappedSpinner {...props} isLoading={isLoading} />
      ) : (
        <>{children}</>
      );
    }
    return (
      <>
        <ShowHide
          show={isLoading === true || [props.blurred, props.dimmed, props.overlay].includes(true)}
        >
          <WrappedSpinner {...props} isLoading={isLoading} />
        </ShowHide>
        {children}
      </>
    );
  }
  return isLoading === true || [props.blurred, props.dimmed, props.overlay].includes(true) ? (
    <WrappedSpinner {...props} isLoading={isLoading} />
  ) : (
    <></>
  );
};

export const Loading = React.memo(_Loading);

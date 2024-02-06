import dynamic from "next/dynamic";
import React, { type ReactNode } from "react";

import clsx from "clsx";

import { type SpinnerProps } from "~/components/icons";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

const Spinner = dynamic(() => import("~/components/icons/Spinner"), { ssr: false });

type BaseLoadingProps = ComponentProps &
  Pick<SpinnerProps, "size" | "loading"> & {
    readonly size?: Exclude<SpinnerProps["size"], "full">;
  };

type LoadingChildProps = BaseLoadingProps & {
  readonly children?: ReactNode;
  readonly hideWhenLoading?: boolean;
  readonly overlay?: never;
};

type LoadingOverlayProps = BaseLoadingProps & {
  readonly overlay: true;
  readonly hideWhenLoading?: never;
  readonly children?: never;
};

export type LoadingProps = LoadingChildProps | LoadingOverlayProps;

const _WrappedSpinner = ({
  size,
  overlay,
  ...props
}: Omit<LoadingProps, "loading" | "children" | "hideWhenLoading">) => (
  <div {...props} className={clsx("loading", { "loading--overlay": overlay }, props.className)}>
    <Spinner size={size} loading={true} />
  </div>
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

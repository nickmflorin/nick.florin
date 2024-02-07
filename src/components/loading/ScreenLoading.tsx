import React from "react";

import clsx from "clsx";

import { Loading, type LoadingProps } from "./Loading";

/**
 * A component that takes up the entire screen/viewport and centers a loading indicator in its
 * center.  This component should be used to show loading state when there is nothing rendered in
 * the content area yet.
 */
export const ScreenLoading = (props: Omit<LoadingProps, "loading">): JSX.Element => (
  <Loading loading={true} className={clsx("loading--screen", props.className)} size="40px" />
);

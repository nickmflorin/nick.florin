import clsx from "clsx";

import { AbstractView, type AbstractViewProps } from "./AbstractView";
import { State, type StateProps } from "./State";

export interface ViewProps extends AbstractViewProps, Omit<StateProps, "children"> {}

export const View = ({
  children,
  isLoading,
  loadingProps,
  error,
  isError,
  ...props
}: ViewProps) => (
  <AbstractView {...props} className={clsx("view", props.className)}>
    <State isLoading={isLoading} loadingProps={loadingProps} error={error} isError={isError}>
      {children}
    </State>
  </AbstractView>
);

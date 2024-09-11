import { classNames } from "~/components/types";

import { State, type StateProps } from "../feedback/State";

import { AbstractView, type AbstractViewProps } from "./AbstractView";

export interface ViewProps extends AbstractViewProps, Omit<StateProps, "children"> {}

export const View = ({
  children,
  isLoading,
  loadingProps,
  error,
  isError,
  ...props
}: ViewProps) => (
  <AbstractView {...props} className={classNames("view", props.className)}>
    <State isLoading={isLoading} loadingProps={loadingProps} error={error} isError={isError}>
      {children}
    </State>
  </AbstractView>
);

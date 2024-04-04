import { type ReactNode } from "react";

import clsx from "clsx";

import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { type ComponentProps } from "~/components/types";

export interface ChartContainerProps extends ComponentProps {
  readonly isInitialLoading?: boolean;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly skeleton: JSX.Element;
  readonly children: ReactNode;
}

export const ChartContainer = ({
  isInitialLoading,
  isLoading,
  error,
  children,
  skeleton,
  ...props
}: ChartContainerProps): JSX.Element => (
  <div {...props} className={clsx("w-full relative", props.className)}>
    <ApiResponseState
      isInitialLoading={isInitialLoading}
      isLoading={isLoading}
      error={error}
      skeleton={skeleton}
    >
      {children}
    </ApiResponseState>
  </div>
);

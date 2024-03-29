import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { ErrorOrRender } from "~/components/views/ErrorOrRender";
import { Loading } from "~/components/views/Loading";

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
    {isInitialLoading ? (
      <div className="px-[20px] py-[20px] w-full h-full">{skeleton}</div>
    ) : (
      <Loading loading={isLoading}>
        <ErrorOrRender error={error}>{children}</ErrorOrRender>
      </Loading>
    )}
  </div>
);

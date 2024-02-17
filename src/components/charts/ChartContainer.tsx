"use client";
import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Error } from "~/components/views/Error";
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
  <div {...props} className={clsx("w-full h-full relative", props.className)}>
    {isInitialLoading ? (
      <div className="px-[20px] py-[20px] w-full h-full">{skeleton}</div>
    ) : (
      <Loading loading={isLoading}>
        <Error error={error}>{children}</Error>
      </Loading>
    )}
  </div>
);

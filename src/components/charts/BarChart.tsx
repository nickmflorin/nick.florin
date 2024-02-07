"use client";
import { ResponsiveBar, type ResponsiveBarSvgProps, type BarDatum } from "@nivo/bar";
import clsx from "clsx";

import { generateChartColors } from "~/lib/charts";
import { type ComponentProps } from "~/components/types";
import { Error } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

import { type BarChartSkeletonProps, BarChartSkeleton } from "./BarChartSkeleton";
import { THEME } from "./theme";

/* eslint-disable no-console */
/* This is a hack to suppress a warning from @nivo/bar charts:
   Support for defaultProps will be removed from function components in a future major release.
   Use JavaScript default parameters instead. */
const error = console.error;
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) {
    return;
  }
  error(...args);
};
/* eslint-enable no-console */

export interface BarChartProps<D extends BarDatum>
  extends Omit<ResponsiveBarSvgProps<D>, "theme" | "data" | "margin">,
    ComponentProps {
  readonly data?: ResponsiveBarSvgProps<D>["data"];
  readonly isInitialLoading?: boolean;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly skeletonProps?: BarChartSkeletonProps;
}

export const BarChart = <D extends BarDatum>({
  isInitialLoading,
  isLoading,
  error,
  skeletonProps,
  data,
  style,
  className,
  ...props
}: BarChartProps<D>): JSX.Element => (
  <div style={style} className={clsx("w-full h-full", className)}>
    {isInitialLoading ? (
      <div className="px-[20px] py-[20px] w-full h-full">
        <BarChartSkeleton {...skeletonProps} />
      </div>
    ) : (
      <Loading loading={isLoading}>
        <Error error={error}>
          <ResponsiveBar<D>
            data={data ?? []}
            padding={0.3}
            colors={generateChartColors((data ?? []).length)}
            valueScale={{ type: "linear" }}
            axisTop={null}
            axisRight={null}
            {...props}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            theme={THEME}
          />
        </Error>
      </Loading>
    )}
  </div>
);

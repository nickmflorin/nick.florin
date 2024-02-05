"use client";
import { ResponsiveBar, type ResponsiveBarSvgProps, type BarDatum } from "@nivo/bar";
import clsx from "clsx";

import { generateChartColors } from "~/lib/charts";
import { type ComponentProps } from "~/components/types";

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
  readonly skeletonVisible?: boolean;
  readonly skeletonProps?: BarChartSkeletonProps;
}

export const BarChart = <D extends BarDatum>({
  skeletonVisible,
  skeletonProps,
  data,
  style,
  className,
  ...props
}: BarChartProps<D>): JSX.Element => (
  <div style={style} className={clsx("w-full h-full", className)}>
    {skeletonVisible ? (
      <div className="px-[20px] py-[20px] w-full h-full">
        <BarChartSkeleton {...skeletonProps} />
      </div>
    ) : data ? (
      <ResponsiveBar<D>
        data={data}
        padding={0.3}
        colors={generateChartColors(data.length)}
        valueScale={{ type: "linear" }}
        axisTop={null}
        axisRight={null}
        {...props}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        theme={THEME}
      />
    ) : (
      <></>
    )}
  </div>
);

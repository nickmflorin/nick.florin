"use client";
import { ResponsiveBar, type ResponsiveBarSvgProps, type BarDatum } from "@nivo/bar";

import { generateChartColors } from "~/lib/charts";

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
  extends Omit<ResponsiveBarSvgProps<D>, "colors" | "theme"> {}

export const BarChart = <D extends BarDatum>(props: ResponsiveBarSvgProps<D>): JSX.Element => (
  <ResponsiveBar<D>
    padding={0.3}
    colors={generateChartColors(props.data.length)}
    valueScale={{ type: "linear" }}
    axisTop={null}
    axisRight={null}
    {...props}
    theme={THEME}
  />
);

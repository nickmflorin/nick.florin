"use client";
import { ResponsiveBar, type BarDatum } from "@nivo/bar";

import type * as types from "./types";

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

export const BarChart = <D extends BarDatum>({
  data,
  ...props
}: types.BarChartProps<D>): JSX.Element => (
  <ResponsiveBar<D>
    data={data ?? []}
    padding={0.3}
    colors={generateChartColors((data ?? []).length)}
    valueScale={{ type: "linear" }}
    axisTop={null}
    axisRight={null}
    {...props}
    margin={{ top: 10, right: 10, bottom: 10, left: 20 }}
    theme={THEME}
  />
);

export default BarChart;

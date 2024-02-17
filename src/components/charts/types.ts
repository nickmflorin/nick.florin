import { type ResponsiveBarSvgProps, type BarDatum } from "@nivo/bar";

export interface BarChartProps<D extends BarDatum>
  extends Omit<ResponsiveBarSvgProps<D>, "theme" | "data" | "margin"> {
  readonly data?: ResponsiveBarSvgProps<D>["data"];
}

export type BarChart = {
  <D extends BarDatum>(props: BarChartProps<D>): JSX.Element;
};

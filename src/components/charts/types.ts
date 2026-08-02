import { type JSX } from 'react';

import { type BarDatum, type ResponsiveBarSvgProps } from '@nivo/bar';

export interface BarChartProps<D extends BarDatum> extends Omit<
  ResponsiveBarSvgProps<D>,
  'data' | 'margin' | 'theme'
> {
  readonly data?: ResponsiveBarSvgProps<D>['data'];
}

export type BarChart = <D extends BarDatum>(props: BarChartProps<D>) => JSX.Element;

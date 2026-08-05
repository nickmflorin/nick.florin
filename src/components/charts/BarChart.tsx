'use client';
import { type JSX } from 'react';

import { type BarDatum, ResponsiveBar } from '@nivo/bar';

import type * as types from './types';

import { generateChartColors } from '~/lib/charts';

import { BarChartBandPadding, BarChartMargins } from './constants';
import { THEME } from './theme';

/* eslint-disable no-console */
/**
 * Suppresses the "Support for defaultProps will be removed from function components in a future
 * major release" warning logged by `@nivo/bar` charts, until the library replaces its use of
 * `defaultProps` with JavaScript default parameters.
 */
const error = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('defaultProps')) {
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
    axisRight={null}
    axisTop={null}
    colors={generateChartColors((data ?? []).length)}
    data={data ?? []}
    padding={BarChartBandPadding}
    valueScale={{ type: 'linear' }}
    {...props}
    margin={BarChartMargins}
    theme={THEME}
  />
);

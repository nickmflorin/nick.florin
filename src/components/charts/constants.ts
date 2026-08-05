/**
 * The margins applied around every bar chart's plot area — the space the chart reserves for its
 * axis ticks and breathing room.
 *
 * These live in their own module (rather than on the chart component) so that chart skeletons can
 * derive the exact same geometry without importing the chart — and therefore Nivo — into their
 * module graph: a skeleton renders precisely in the states where the chart's chunk has not
 * loaded.
 */
export const BarChartMargins = { bottom: 10, left: 20, right: 10, top: 10 } as const;

/**
 * The fraction of each bar's band that is left empty (Nivo's `padding`); each bar occupies the
 * remaining fraction of its band, centered.
 */
export const BarChartBandPadding = 0.3;

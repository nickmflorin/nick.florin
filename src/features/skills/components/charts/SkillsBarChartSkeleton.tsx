import { BarChartBandPadding, BarChartMargins } from '~/components/charts/constants';
import { Skeleton } from '~/components/loading/Skeleton';
import { classNames } from '~/components/types';

import { SkillsBarChartHeightClassNames } from './constants';

/**
 * The placeholder bar heights, as percentages of the chart's plot area, mirroring the real
 * chart's shape: experience-descending bars with plateaus where several skills share a value.
 *
 * The heights are a fixed sequence rather than randomized so the skeleton renders identically on
 * the server and on every client render — randomness would produce a hydration mismatch.
 */
const BarHeightPercentages = [
  100, 79, 71, 71, 64, 64, 57, 57, 57, 57, 57, 50, 50, 50, 50, 36, 36, 36, 36, 29, 14, 14, 14, 14,
];

/**
 * The widths of the placeholder legend labels, in pixels, varied to mirror the ragged widths of
 * the real legend's skill names.
 */
const LegendLabelWidths = [52, 44, 36, 72, 110, 40, 34, 96, 78, 88, 118, 60, 100, 74, 64, 46];

/**
 * The width of each placeholder bar within its band, derived from the same band padding the real
 * chart renders with.
 */
const BarWidthPercentage = `${(1 - BarChartBandPadding) * 100}%`;

/**
 * A skeleton occupying the exact space of the rendered skills bar chart and its legend, laid out
 * from the same geometry the chart itself renders with: the plot area is inset by
 * {@link BarChartMargins}, the bars are centered within adjacent bands at the width the chart's
 * band padding produces, and the legend mirrors the real legend's inset, item height, and gaps.
 *
 * The chart can only draw after the client mounts and measures its container, so every state
 * before that — the streamed slot fallback, the chunk-loading fallback, and the pre-mount render
 * — shows this same skeleton. Rendering the same placeholder in all pre-ready states is what
 * prevents the legend (plain DOM that would otherwise paint immediately) from appearing,
 * disappearing during the chunk swap, and reappearing when the chart finally draws.
 */
export const SkillsBarChartSkeleton = () => (
  <div className='flex flex-col gap-[8px] h-full w-full max-h-full max-w-full'>
    <div
      className={classNames('flex flex-row', SkillsBarChartHeightClassNames)}
      style={{
        paddingBottom: BarChartMargins.bottom,
        paddingLeft: BarChartMargins.left,
        paddingRight: BarChartMargins.right,
        paddingTop: BarChartMargins.top,
      }}
    >
      {BarHeightPercentages.map((height, i) => (
        <div className='flex flex-1 flex-col items-center justify-end h-full' key={i}>
          <Skeleton height={`${height}%`} width={BarWidthPercentage} />
        </div>
      ))}
    </div>
    <div className='px-[10px] max-w-full'>
      {/* The item, dot and label sizes step down below the 'sm' breakpoint, mirroring the
          responsive sizing the real legend's items render with. */}
      <div className='flex flex-wrap gap-y-[4px] gap-x-[6px] overflow-x-hidden'>
        {LegendLabelWidths.map((width, i) => (
          <span className='flex flex-row items-center gap-[3px] h-[16px] sm:h-[18px]' key={i}>
            <Skeleton className='!rounded-full h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]' />
            <Skeleton className='h-[10px] sm:h-[12px]' width={width} />
          </span>
        ))}
      </div>
    </div>
  </div>
);

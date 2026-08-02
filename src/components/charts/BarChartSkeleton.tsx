import { clamp } from 'lodash-es';

import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';

export interface BarChartSkeletonProps extends ComponentProps {
  readonly gap?: number;
  readonly heightStep?: number;
  readonly maxBarHeight?: number;
  readonly minBarHeight?: number;
  readonly numBars?: number;
}

const generateHeights = ({
  heightStep,
  maxBarHeight = 100,
  minBarHeight = 30,
  numBars = 10,
}: Pick<
  BarChartSkeletonProps,
  'heightStep' | 'maxBarHeight' | 'minBarHeight' | 'numBars'
>): `${number}%`[] => {
  const heights: number[] = [];
  const step = heightStep
    ? clamp(heightStep, 1, 100)
    : (Math.min(100, maxBarHeight) - Math.max(minBarHeight, 0)) / Math.max(numBars, 1);
  for (let i = 0; i < numBars; i++) {
    heights.push(Math.max(minBarHeight, 0) + i * step);
  }
  return heights.reverse().map((height): `${number}%` => `${height}%`);
};

export const BarChartSkeleton = ({
  gap = 4,
  heightStep,
  maxBarHeight,
  minBarHeight,
  numBars = 10,
  ...props
}: BarChartSkeletonProps) => (
  <div
    {...props}
    className={classNames('flex flex-row h-full w-full items-end px-4', props.className)}
    style={{ ...props.style, gap }}
  >
    {generateHeights({ heightStep, maxBarHeight, minBarHeight, numBars }).map((height, i) => (
      <Skeleton className='flex-1' height={height} key={i} />
    ))}
  </div>
);

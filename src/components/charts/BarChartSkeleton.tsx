import { clamp } from "lodash-es";

import { Skeleton } from "~/components/loading/Skeleton";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface BarChartSkeletonProps extends ComponentProps {
  readonly gap?: number;
  readonly numBars?: number;
  readonly heightStep?: number;
  readonly minBarHeight?: number;
  readonly maxBarHeight?: number;
}

const generateHeights = ({
  numBars = 10,
  heightStep,
  minBarHeight = 30,
  maxBarHeight = 100,
}: Pick<
  BarChartSkeletonProps,
  "numBars" | "minBarHeight" | "maxBarHeight" | "heightStep"
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
  numBars = 10,
  maxBarHeight,
  minBarHeight,
  heightStep,
  gap = 4,
  ...props
}: BarChartSkeletonProps) => (
  <div
    {...props}
    className={classNames("flex flex-row h-full w-full items-end px-4", props.className)}
    style={{ ...props.style, gap }}
  >
    {generateHeights({ numBars, minBarHeight, maxBarHeight, heightStep }).map((height, i) => (
      <Skeleton key={i} className="flex-1" height={height} />
    ))}
  </div>
);

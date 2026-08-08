import { classNames, type ComponentProps, type QuantitativeSize } from '~/components/types';

/**
 * The vertical margin that turns a {@link Skeleton} sized to a font size into one that occupies
 * the full line box that text renders in.
 *
 * The theme's text sizes pair a font size with a line height a few pixels taller than it, so a bar
 * sized to the font alone leaves the block it sits in shorter than the text it stands in for.
 * Adding this to a bar whose height is 4px below the line height makes the two agree exactly.
 */
export const SkeletonLineOffset = 'my-[2px]';

export interface SkeletonProps extends ComponentProps {
  readonly height?: QuantitativeSize<'%' | 'px'>;
  readonly width?: QuantitativeSize<'%' | 'px'>;
}

export const Skeleton = ({ height, width, ...props }: SkeletonProps) => (
  <div
    {...props}
    className={classNames('rounded-sm bg-gray-200 animate-pulse', props.className)}
    style={{
      ...props.style,
      height: height ?? props.style?.height,
      width: width ?? props.style?.width,
    }}
  />
);

import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';

/**
 * The height of a paginator button, matching the `small` button size the paginator's own styles
 * apply to the controls it renders.
 */
const PaginatorButtonSize = 32;

/**
 * The number of page controls the skeleton stands in for.
 *
 * The real paginator's middle group is as wide as its page count, which is not known until the
 * count has been read. The row's height is what governs whether the swap shifts the page, so the
 * middle group is a representative width rather than an exact one.
 */
const PaginatorPageControls = 5;

export interface PaginatorSkeletonProps extends Pick<ComponentProps, 'className'> {}

export const PaginatorSkeleton = ({ className }: PaginatorSkeletonProps) => (
  <div className={classNames('flex w-full flex-row items-center gap-[6px]', className)}>
    <Skeleton height={PaginatorButtonSize} width={PaginatorButtonSize} />
    <div className='mx-auto flex flex-row items-center gap-[6px]'>
      {Array.from({ length: PaginatorPageControls }, (_, index) => (
        <Skeleton height={PaginatorButtonSize} key={index} width={PaginatorButtonSize} />
      ))}
    </div>
    <Skeleton height={PaginatorButtonSize} width={PaginatorButtonSize} />
  </div>
);

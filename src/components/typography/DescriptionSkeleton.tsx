import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';

export interface DescriptionSkeletonProps extends ComponentProps {
  readonly numLines?: number;
}

export const DescriptionSkeleton = ({ numLines = 2, ...props }: DescriptionSkeletonProps) => (
  <div {...props} className={classNames('flex flex-col gap-2', props.className)}>
    {Array.from({ length: numLines }).map((_, i) => (
      <Skeleton
        className={classNames({
          'w-[50%]': i === numLines - 1 && numLines > 2,
          'w-[80%]': i !== numLines - 1 || numLines <= 2,
        })}
        height={8}
        key={i}
      />
    ))}
  </div>
);

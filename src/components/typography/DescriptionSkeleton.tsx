import { Skeleton } from "~/components/loading/Skeleton";
import { type ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface DescriptionSkeletonProps extends ComponentProps {
  readonly numLines?: number;
}

export const DescriptionSkeleton = ({ numLines = 2, ...props }: DescriptionSkeletonProps) => (
  <div {...props} className={classNames("flex flex-col gap-2", props.className)}>
    {Array.from({ length: numLines }).map((_, i) => (
      <Skeleton
        key={i}
        className={classNames({
          "w-[80%]": i !== numLines - 1 || numLines <= 2,
          "w-[50%]": i === numLines - 1 && numLines > 2,
        })}
        height={8}
      />
    ))}
  </div>
);

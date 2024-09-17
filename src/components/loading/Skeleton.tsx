import type { ComponentProps, Size } from "~/components/types";
import { classNames } from "~/components/types";

export interface SkeletonProps extends ComponentProps {
  readonly height?: Size;
  readonly width?: Size;
}

export const Skeleton = ({ height, width, ...props }: SkeletonProps) => (
  <div
    {...props}
    className={classNames("skeleton", props.className)}
    style={{
      ...props.style,
      height: height ?? props.style?.height,
      width: width ?? props.style?.width,
    }}
  />
);

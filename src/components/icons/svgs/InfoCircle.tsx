import { type Optional } from "utility-types";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { Circle, type CircleProps } from "./Circle";

export interface InfoCircleProps
  extends ComponentProps,
    Optional<Pick<CircleProps, "size">, "size"> {
  readonly textClassName?: ComponentProps["className"];
  readonly circleClassName?: ComponentProps["className"];
}

export const InfoCircle = ({
  circleClassName = "fill-gray-200",
  textClassName,
  size = 22,
  ...props
}: InfoCircleProps) => (
  <div
    className={classNames("flex flex-col items-center justify-center", props.className)}
    style={{ ...props.style, height: `${size}px`, width: `${size}px` }}
  >
    <Circle size={size} className={classNames("absolute top-0 left-0", circleClassName)} />
    <div
      className={classNames(
        "flex items-center justify-center relative top-[0.5px]",
        "leading-[14px] font-bold font-mono text-gray-600 font-bold z-10",
        { "text-xxs": size <= 18, "text-xs": size > 18 && size < 24, "text-sm": size >= 24 },
        textClassName,
      )}
    >
      i
    </div>
  </div>
);

import { clamp } from "lodash-es";

import {
  classNames,
  inferQuantitativeSizeValue,
  sizeToString,
  type ComponentProps,
  type QuantitativeSize,
} from "~/components/types";
import { BaseTypography, type BaseTypographyProps } from "~/components/typography/BaseTypography";

export interface CircleNumberProps
  extends ComponentProps,
    Omit<BaseTypographyProps<"div">, "lineHeight" | "component"> {
  readonly children: number | string;
  readonly size?: QuantitativeSize<"px">;
  readonly isActive?: boolean;
  readonly activeClassName?: ComponentProps["className"];
  readonly inactiveClassName?: ComponentProps["className"];
}

export const CircleNumber = ({
  children,
  activeClassName,
  inactiveClassName,
  isActive = false,
  size = "24px",
  ...props
}: CircleNumberProps): JSX.Element => (
  <BaseTypography
    {...props}
    component="div"
    className={classNames(
      "flex items-center justify-center rounded-full p-[2px]",
      {
        [classNames("bg-blue-700 text-white", activeClassName)]: isActive,
        [classNames("bg-gray-300 text-body", inactiveClassName)]: !isActive,
      },
      props.className,
    )}
    style={{
      ...props.style,
      height: sizeToString(clamp(inferQuantitativeSizeValue(size), 12, 64), "px"),
      width: sizeToString(clamp(inferQuantitativeSizeValue(size), 12, 64), "px"),
      aspectRatio: "1/1",
      lineHeight: sizeToString(inferQuantitativeSizeValue(size) - 4, "px"),
    }}
  >
    {children}
  </BaseTypography>
);

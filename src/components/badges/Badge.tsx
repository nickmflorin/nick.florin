import React from "react";

import clsx from "clsx";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";
import {
  type TypographySize,
  TypographySizes,
  type FontWeight,
  FontWeights,
} from "~/components/typography";

export interface BadgeProps extends ComponentProps {
  readonly children: string;
  readonly size?: TypographySize;
  readonly fontWeight?: FontWeight;
  readonly icon?: IconProp;
  readonly iconClassName?: ComponentProps["className"];
  readonly transform?: "uppercase" | "lowercase" | "capitalize";
}

export const Badge = ({
  children,
  fontWeight = FontWeights.SEMIBOLD,
  size = TypographySizes.MD,
  icon,
  transform,
  iconClassName,
  ...props
}: BadgeProps): JSX.Element => (
  <div
    {...props}
    className={clsx(
      "badge",
      `badge--size-${size}`,
      `font-weight-${fontWeight}`,
      {
        uppercase: transform === "uppercase",
        lowercase: transform === "lowercase",
        capitalize: transform === "capitalize",
      },
      props.className,
    )}
  >
    <div className="badge__content">
      {icon && <Icon className={clsx("badge__icon", iconClassName)} icon={icon} />}
      <div className="badge__text">{children}</div>
    </div>
  </div>
);

export default Badge;

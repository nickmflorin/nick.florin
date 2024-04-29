import React from "react";

import clsx from "clsx";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import {
  type ComponentProps,
  type HTMLElementProps,
  BodyFontSizes,
  FontWeights,
  getTypographyClassName,
  type BaseTypographyProps,
} from "~/components/types";

export interface BadgeProps
  extends ComponentProps,
    BaseTypographyProps,
    Pick<HTMLElementProps<"div">, "onClick"> {
  readonly children: string;
  readonly icon?: IconProp | null;
  readonly iconClassName?: ComponentProps["className"];
}

export const Badge = ({
  children,
  fontWeight = FontWeights.MEDIUM,
  fontSize = BodyFontSizes.SM,
  icon,
  transform,
  fontFamily,
  iconClassName,
  ...props
}: BadgeProps): JSX.Element => (
  <div
    {...props}
    className={clsx(
      "badge",
      `badge--size-${fontSize}`,
      { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
      // Omit the font size prop because it is handled by the badge size.
      getTypographyClassName({ fontWeight, transform, fontFamily }),
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

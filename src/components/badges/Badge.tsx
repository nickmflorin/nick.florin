import React from "react";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import {
  TextFontSizes,
  FontWeights,
  getTypographyClassName,
  type TypographyCharacteristics,
} from "~/components/types/typography";

export interface BadgeProps
  extends ComponentProps,
    TypographyCharacteristics,
    Pick<HTMLElementProps<"div">, "onClick"> {
  readonly children: string;
  readonly icon?: IconProp | null;
  readonly iconClassName?: ComponentProps["className"];
}

export const Badge = ({
  children,
  fontWeight = FontWeights.MEDIUM,
  fontSize = TextFontSizes.SM,
  icon,
  transform,
  fontFamily,
  iconClassName,
  ...props
}: BadgeProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "badge",
      `badge--size-${fontSize}`,
      { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
      // Omit the font size prop because it is handled by the badge size.
      getTypographyClassName({ fontWeight, transform, fontFamily }),
      props.className,
    )}
  >
    <div className="badge__content">
      {icon && <Icon className={classNames("badge__icon", iconClassName)} icon={icon} />}
      <div className="badge__text">{children}</div>
    </div>
  </div>
);

export default Badge;

import Image from "next/image";
import React from "react";

import clsx from "clsx";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import {
  FontSizes,
  FontWeights,
  getTypographyClassName,
  type ExtendingTypographyProps,
} from "~/components/typography";

export interface BadgeProps
  extends ComponentProps,
    ExtendingTypographyProps,
    Pick<HTMLElementProps<"div">, "onClick"> {
  readonly children: string;
  readonly icon?: IconProp | `/${string}.svg` | null;
  readonly iconClassName?: ComponentProps["className"];
}

const IconOrLocalImage = ({
  icon,
  iconClassName,
}: Pick<BadgeProps, "icon" | "iconClassName">): JSX.Element => {
  if (typeof icon === "string") {
    return (
      <Image
        className={clsx("badge__icon", iconClassName)}
        src={icon}
        height={16}
        width={16}
        alt="Test"
      />
    );
  } else if (icon) {
    return <Icon className={clsx("badge__icon", iconClassName)} icon={icon} />;
  }
  return <></>;
};

export const Badge = ({
  children,
  fontWeight = FontWeights.MEDIUM,
  fontSize = FontSizes.SM,
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
      {
        "pointer-events-auto cursor-pointer": props.onClick !== undefined,
      },
      // Omit the font size prop because it is handled by the badge size.
      getTypographyClassName({ fontWeight, transform, fontFamily }),
      props.className,
    )}
  >
    <div className="badge__content">
      <IconOrLocalImage icon={icon} iconClassName={iconClassName} />
      <div className="badge__text">{children}</div>
    </div>
  </div>
);

export default Badge;

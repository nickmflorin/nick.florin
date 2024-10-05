import React, { type ReactNode } from "react";

import { IconButton } from "~/components/buttons";
import { type IconProp, type IconName, isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import {
  type ComponentProps,
  type BorderRadius,
  classNames,
  parseDataAttributes,
} from "~/components/types";
import { BaseTypography, type BaseTypographyProps } from "~/components/typography/BaseTypography";

import { type BadgeSize, BadgeSizes } from "./types";

export interface BadgeProps extends Omit<BaseTypographyProps<"div">, "lineClamp" | "component"> {
  readonly children: ReactNode;
  readonly iconClassName?: ComponentProps["className"];
  readonly icon?: IconProp | IconName | JSX.Element | null;
  readonly radius?: BorderRadius;
  readonly size?: BadgeSize;
  readonly onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Badge = ({
  children,
  size = BadgeSizes.SM,
  icon,
  iconClassName,
  radius,
  onClose,
  ...props
}: BadgeProps): JSX.Element => (
  <BaseTypography<"div">
    {...props}
    component="div"
    {...parseDataAttributes({ size, radius })}
    className={classNames(
      "badge",
      { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
      props.className,
    )}
  >
    <div className="badge__content">
      {typeof icon === "string" || isIconProp(icon) ? (
        <Icon className={classNames("badge__icon", iconClassName)} icon={icon} />
      ) : (
        icon
      )}
      <div className="badge__text">{children}</div>
      {onClose && (
        <IconButton.Transparent
          className="badge__close-button hover:bg-transparent"
          scheme="light"
          icon="xmark"
          element="button"
          onClick={e => {
            e.stopPropagation();
            onClose(e);
          }}
        />
      )}
    </div>
  </BaseTypography>
);

export default Badge;

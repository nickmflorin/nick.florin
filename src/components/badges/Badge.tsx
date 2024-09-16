import React, { type ReactNode } from "react";

import { IconButton } from "~/components/buttons";
import { type IconProp, type IconName, isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import {
  type ComponentProps,
  FontWeights,
  getTypographyClassName,
  type TypographyCharacteristics,
  type BorderRadius,
  classNames,
} from "~/components/types";

import { type BadgeSize, BadgeSizes } from "./types";

export interface BadgeProps
  extends ComponentProps,
    Omit<TypographyCharacteristics, "lineClamp">,
    Pick<React.ComponentProps<"div">, "onClick"> {
  readonly children: ReactNode;
  readonly iconClassName?: ComponentProps["className"];
  readonly icon?: IconProp | IconName | JSX.Element | null;
  readonly radius?: BorderRadius;
  readonly size?: BadgeSize;
  readonly onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Badge = ({
  children,
  fontWeight = FontWeights.MEDIUM,
  fontSize,
  size = BadgeSizes.SM,
  icon,
  transform,
  fontFamily,
  iconClassName,
  radius,
  align,
  truncate,
  onClose,
  ...props
}: BadgeProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "badge",
      `badge--size-${size}`,
      radius ? `badge--radius-${radius}` : "",
      { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
      getTypographyClassName({
        fontWeight,
        transform,
        fontFamily,
        fontSize,
        align,
        truncate,
      }),
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
  </div>
);

export default Badge;

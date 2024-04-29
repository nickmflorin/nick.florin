import clsx from "clsx";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import {
  type ComponentProps,
  type Size,
  sizeToString,
  getTypographyClassName,
  type BaseTypographyProps,
} from "~/components/types";

export interface TagProps extends BaseTypographyProps, ComponentProps {
  readonly iconClassName?: ComponentProps["className"];
  readonly icon: IconProp;
  readonly gap?: Size;
  readonly children: string;
}

export const Tag = ({
  icon,
  className,
  iconClassName,
  gap = "4px",
  style,
  children,
  ...props
}: TagProps): JSX.Element => (
  <div
    className={clsx("tag", getTypographyClassName(props), className)}
    style={{ ...style, gap: sizeToString(gap, "px") }}
  >
    <div className="tag__content">
      {icon && <Icon className={clsx("tag__icon", iconClassName)} icon={icon} />}
      <div className="tag__text">{children}</div>
    </div>
  </div>
);

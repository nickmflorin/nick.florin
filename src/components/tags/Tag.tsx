import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { type Size, sizeToString } from "~/components/types/sizes";
import {
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types/typography";

export interface TagProps extends TypographyCharacteristics, ComponentProps {
  readonly iconClassName?: ComponentProps["className"];
  readonly icon?: IconProp;
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
    className={classNames("tag", getTypographyClassName(props), className)}
    style={{ ...style, gap: sizeToString(gap, "px") }}
  >
    <div className="tag__content">
      {icon && <Icon className={classNames("tag__icon", iconClassName)} icon={icon} />}
      <div className="tag__text">{children}</div>
    </div>
  </div>
);

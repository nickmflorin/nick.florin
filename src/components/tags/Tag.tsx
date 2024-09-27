import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { type QuantitativeSize, sizeToString } from "~/components/types/sizes";
import { BaseTypography, type BaseTypographyProps } from "~/components/typography/BaseTypography";

export interface TagProps extends Omit<BaseTypographyProps<"div">, "component"> {
  readonly iconClassName?: ComponentProps["className"];
  readonly icon?: IconProp;
  readonly gap?: QuantitativeSize<"px">;
  readonly children: string;
}

export const Tag = ({
  icon,
  iconClassName,
  gap = "4px",
  children,
  ...props
}: TagProps): JSX.Element => (
  <BaseTypography
    {...props}
    component="div"
    className={classNames("tag", props.className)}
    style={{ ...props.style, gap: sizeToString(gap, "px" as const) }}
  >
    <div className="tag__content">
      {icon && <Icon className={classNames("tag__icon", iconClassName)} icon={icon} />}
      <div className="tag__text">{children}</div>
    </div>
  </BaseTypography>
);

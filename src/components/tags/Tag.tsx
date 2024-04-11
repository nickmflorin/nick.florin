import clsx from "clsx";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps, withoutOverridingClassName } from "~/components/types";

import { Text, type TextProps } from "../typography/Text";

export interface TagProps extends Omit<TextProps, "fontWeight"> {
  readonly textClassName?: ComponentProps["className"];
  readonly icon: IconProp;
}

export const Tag = ({
  icon,
  textClassName,
  size = "sm",
  className,
  style,
  children,
  ...props
}: TagProps): JSX.Element => (
  <div style={style} className={clsx("flex flex-row items-center gap-[4px]", className)}>
    <Icon icon={icon} size="15px" className="text-label" />
    <Text
      {...props}
      size={size}
      className={clsx(
        withoutOverridingClassName("text-label", textClassName),
        withoutOverridingClassName("leading-[16px]", textClassName),
        textClassName,
      )}
      fontWeight="medium"
    >
      {children}
    </Text>
  </div>
);

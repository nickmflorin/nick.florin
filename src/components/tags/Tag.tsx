import clsx from "clsx";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import {
  type ComponentProps,
  withoutOverridingClassName,
  type Size,
  sizeToString,
} from "~/components/types";

import { Text, type TextProps } from "../typography/Text";

export interface TagProps extends TextProps {
  readonly textClassName?: ComponentProps["className"];
  readonly icon: IconProp;
  readonly gap?: Size;
}

export const Tag = ({
  icon,
  textClassName,
  fontSize = "sm",
  className,
  gap = "4px",
  style,
  children,
  ...props
}: TagProps): JSX.Element => (
  <div
    className={clsx("flex flex-row items-center", className)}
    style={{ ...style, gap: sizeToString(gap, "px") }}
  >
    <Icon icon={icon} size="15px" className="text-label" />
    <Text
      fontWeight="medium"
      {...props}
      fontSize={fontSize}
      className={clsx(
        withoutOverridingClassName("text-label", textClassName),
        withoutOverridingClassName("leading-[16px]", textClassName),
        textClassName,
      )}
    >
      {children}
    </Text>
  </div>
);

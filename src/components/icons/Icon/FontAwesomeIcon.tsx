import { forwardRef } from "react";

import { type FontAwesomeIconProp, type IconProps, type IconName } from "~/components/icons/types";
import { classNames } from "~/components/types";

import { NativeIcon, type NativeIconProps } from "./NativeIcon";
import { getFontAwesomeIconClassName } from "./util";

export interface FontAwesomeIconProps
  extends NativeIconProps,
    Pick<IconProps, "iconStyle" | "family"> {
  readonly icon: FontAwesomeIconProp | IconName;
}

export const FontAwesomeIcon = forwardRef<HTMLElement, FontAwesomeIconProps>(
  ({ icon, iconStyle, family, ...props }, ref) => (
    <NativeIcon
      {...props}
      ref={ref}
      className={classNames(
        getFontAwesomeIconClassName(
          typeof icon === "string"
            ? { name: icon, iconStyle, family }
            : { iconStyle, family, ...icon },
        ),
        props.className,
      )}
    />
  ),
);

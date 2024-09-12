import { forwardRef, type ReactNode } from "react";

import { type IconProps } from "~/components/icons/types";
import { classNames } from "~/components/types";

import { getNativeIconStyle, type DynamicIconClassNamePropName } from "./util";

export type NativeIconProps = Pick<
  IconProps,
  "style" | "className" | DynamicIconClassNamePropName
> & {
  readonly children?: ReactNode;
};

export const NativeIcon = forwardRef<HTMLElement, NativeIconProps>((props, ref) => (
  <i
    ref={ref}
    className={classNames(props.className)}
    style={{ ...props.style, ...getNativeIconStyle(props) }}
  >
    {props.children}
  </i>
));

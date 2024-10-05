import { forwardRef, type ReactNode } from "react";

import { pick } from "lodash-es";

import { type IconProps, IconDiscreteSizes } from "~/components/icons/types";
import { parseDataAttributes, classNames } from "~/components/types";

import { getNativeIconStyle } from "./util";

export type NativeIconProps = Pick<
  IconProps,
  "style" | "className" | "size" | "dimension" | "fit" | "isDisabled"
> & {
  readonly children?: ReactNode;
};

export const NativeIcon = forwardRef<HTMLElement, NativeIconProps>((props, ref) => (
  <i
    ref={ref}
    {...parseDataAttributes({
      ...pick(props, ["fit", "dimension", "isDisabled"] as const),
      size: IconDiscreteSizes.contains(props.size) ? props.size : undefined,
    })}
    className={classNames("icon", props.className)}
    style={{ ...props.style, ...getNativeIconStyle(props) }}
  >
    {props.children}
  </i>
));

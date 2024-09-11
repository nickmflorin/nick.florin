import { classNames } from "~/components/types";

import { type IconProps } from "../types";

import { getNativeIconStyle, type DynamicIconClassNamePropName } from "./util";

export const NativeIcon = (
  props: { isVisible: boolean; children?: JSX.Element } & Pick<
    IconProps,
    "style" | "className" | DynamicIconClassNamePropName
  >,
) => (
  <i
    className={classNames(props.className)}
    style={
      props.isVisible === false
        ? { ...props.style, display: "none", ...getNativeIconStyle(props) }
        : { ...props.style, ...getNativeIconStyle(props) }
    }
  >
    {props.children}
  </i>
);

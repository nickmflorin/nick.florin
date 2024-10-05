import { sizeToString, type QuantitativeSizeString } from "~/components/types";

import * as types from "./types";

export const toIconSize = (
  size: types.ButtonIconSize | undefined,
): QuantitativeSizeString<"px"> | undefined =>
  /* If the icon size corresponds to a discrete size, it will be set with a class name by the
     abstract form of the button.  Otherwise, the size has to be provided directly to the Icon
     component, in the case that it is non discrete (e.g. 32px, not "small"). */
  size !== undefined && !types.ButtonDiscreteIconSizes.contains(size)
    ? sizeToString(size, "px")
    : undefined;

export type ButtonSizeStyleProps = {
  readonly size?: types.ButtonSize;
};

export const getButtonSizeStyle = (props: ButtonSizeStyleProps) =>
  !types.ButtonDiscreteIconSizes.contains(props.size) && props.size !== undefined
    ? {
        height: sizeToString(props.size, "px"),
        minHeight: sizeToString(props.size, "px"),
      }
    : {};

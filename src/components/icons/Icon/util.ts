import { type IconName } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

import { type Style } from "~/components/types";

import {
  type IconFamily,
  type IconStyle,
  IconStyleClassNameMap,
  IconFamilyClassNameMap,
  DEFAULT_ICON_FAMILY,
  DEFAULT_ICON_STYLE,
  IconDiscreteSizes,
  type IconProp,
  type IconProps,
  IconDimensions,
  IconFits,
  type ChildrenIconProps,
  type FontAwesomeIconProp,
  type BasicIconProps,
} from "../types";

const getIconNameClassName = (name: IconName) => `fa-${name}`;

const getIconFamilyClassName = (family: IconFamily = DEFAULT_ICON_FAMILY) =>
  IconFamilyClassNameMap[family];

const getIconStyleClassName = (iconStyle: IconStyle = DEFAULT_ICON_STYLE) =>
  IconStyleClassNameMap[iconStyle];

/**
 * Returns the appropriate Font Awesome native class names for the <i> element that is rendered by
 * the <Icon /> component, based on the provided icon information.  These class names will be used
 * by the Font Awesome script to render the appropriate <svg> icon inside of the <i> element.
 *
 * Note:
 * ----
 * The "@fortawesome/react-fontawesome" package's <FontAwesomeIcon /> component does not work
 * properly with the FontAwesome Icon Kit.  We use the Icon Kit because it dynamically loads just
 * the icons that we need from a CDN - which is much faster and easier to maintain.  However, it
 * does not work with React - only CSS classes.  This method is designed to return the appropriate
 * class name for the <i> element, based on the provided icon information, so that the class names
 * defined in the stylesheets loaded from the CDN can properly render the icon.
 *
 * @param {FontAwesomeIconProp} icon
 *   The properties of the icon to be rendered.  This includes the icon's name, {@link IconName},
 *   and optionally the icon's style, {@link IconStyle} and family, {@link IconFamily}.
 *
 * @returns {string}
 */
export const getNativeIconClassName = ({ family, iconStyle, name }: FontAwesomeIconProp): string =>
  clsx(
    getIconFamilyClassName(family),
    getIconStyleClassName(iconStyle),
    getIconNameClassName(name),
  );

export const getNativeIconStyle = ({
  size,
  dimension = IconDimensions.HEIGHT,
  fit = IconFits.FIT,
}: Pick<IconProps, "size" | "dimension" | "fit">): Style => {
  if (size === undefined || IconDiscreteSizes.contains(size)) {
    return {};
  } else if (dimension === IconDimensions.HEIGHT) {
    return { height: size, width: "auto", aspectRatio: fit === IconFits.SQUARE ? 1 : undefined };
  } else {
    return { width: size, height: "auto", aspectRatio: fit === IconFits.SQUARE ? 1 : undefined };
  }
};

const DynamicIconClassNamePropNames = ["fit", "size", "dimension", "isDisabled"] as const;

export type DynamicIconClassNamePropName = (typeof DynamicIconClassNamePropNames)[number];

type DynamicIconClassNameProps = Pick<IconProps, DynamicIconClassNamePropName>;

type DynamicIconClassNameConfig<N extends DynamicIconClassNamePropName> = (
  dynamic: DynamicIconClassNameProps[N],
) => string | null;

const DynamicClassNameConfig: {
  [key in DynamicIconClassNamePropName]: DynamicIconClassNameConfig<key>;
} = {
  isDisabled: v => (v !== undefined ? "disabled" : null),
  fit: v => (v !== undefined ? `icon--fit-${v}` : null),
  /* The size class is only applicable if the size is provided as a discrete size string, not a
     literal size value (e.g. "sm", not "30px"). */
  size: v => (v !== undefined && IconDiscreteSizes.contains(v) ? `icon--size-${v}` : null),
  dimension: v => (v !== undefined ? `icon--dimension-${v}` : null),
};

const getDynamicIconClassName = (props: Pick<IconProps, DynamicIconClassNamePropName>): string =>
  [...DynamicIconClassNamePropNames].reduce(
    <N extends DynamicIconClassNamePropName>(prev: string, curr: N) => {
      const propName = curr as N;
      return clsx(prev, DynamicClassNameConfig[propName](props[propName]));
    },
    "",
  );

export const getInternalIconClassName = ({
  className,
  ...props
}: Pick<
  BasicIconProps<IconProp> | ChildrenIconProps,
  "className" | DynamicIconClassNamePropName
>): string => clsx("icon", getDynamicIconClassName(props), className);

export const getIconClassName = ({
  icon,
  ...rest
}: Pick<BasicIconProps<IconProp>, "className" | DynamicIconClassNamePropName> & {
  icon: FontAwesomeIconProp;
}): string => clsx(getNativeIconClassName(icon), getInternalIconClassName(rest));

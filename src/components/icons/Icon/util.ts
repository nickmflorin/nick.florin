import { type IconName } from '@fortawesome/fontawesome-svg-core';

import {
  DEFAULT_ICON_FAMILY,
  DEFAULT_ICON_STYLE,
  type FontAwesomeIconProp,
  IconDimensions,
  IconDiscreteSizes,
  type IconFamily,
  IconFamilyClassNameMap,
  IconFits,
  type IconProps,
  type IconStyle,
  IconStyleClassNameMap,
} from '~/components/icons';
import { classNames, type Style } from '~/components/types';

const getIconNameClassName = (name: IconName) => `fa-${name}`;

const getIconFamilyClassName = (family: IconFamily = DEFAULT_ICON_FAMILY) =>
  IconFamilyClassNameMap[family];

const getIconStyleClassName = (style: IconStyle = DEFAULT_ICON_STYLE) =>
  IconStyleClassNameMap[style];

/**
 * Returns the appropriate Font Awesome native class names for the <i> element that is rendered by
 * the <Icon /> component, based on the provided icon information. These class names will be used
 * by the Font Awesome script to render the appropriate <svg> icon inside of the <i> element.
 *
 * The `@fortawesome/react-fontawesome` package's `<FontAwesomeIcon />` component does not work
 * properly with the FontAwesome Icon Kit. The Icon Kit is used because it dynamically loads just
 * the icons that are needed from a CDN, which is much faster and easier to maintain, but it does
 * not work with React - only CSS classes. This function returns the appropriate class name for
 * the <i> element, based on the provided icon information, so that the class names defined in the
 * stylesheets loaded from the CDN can properly render the icon.
 *
 * @param {FontAwesomeIconProp} icon
 *   The properties of the icon to be rendered. This includes the icon's name, {@link IconName},
 *   and optionally the icon's style, {@link IconStyle} and family, {@link IconFamily}.
 *
 * @returns {string}
 */
export const getFontAwesomeIconClassName = ({
  family,
  iconStyle,
  name,
}: FontAwesomeIconProp): string =>
  classNames(
    getIconFamilyClassName(family),
    getIconStyleClassName(iconStyle),
    getIconNameClassName(name),
  );

export const getNativeIconStyle = ({
  dimension = IconDimensions.HEIGHT,
  fit = IconFits.FIT,
  size,
}: Pick<IconProps, 'dimension' | 'fit' | 'size'>): Style => {
  if (size === undefined || IconDiscreteSizes.contains(size)) {
    // In this case, the sizing is handled by SASS via class names on the <i> element.
    return {};
  } else if (dimension === IconDimensions.HEIGHT) {
    return {
      aspectRatio: fit === IconFits.SQUARE ? 1 : undefined,
      height: size,
      maxWidth: size,
      width: 'auto',
    };
  }
  return {
    aspectRatio: fit === IconFits.SQUARE ? 1 : undefined,
    height: 'auto',
    maxHeight: size,
    width: size,
  };
};

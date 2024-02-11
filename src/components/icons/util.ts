import { type IconName } from "@fortawesome/fontawesome-svg-core";

import {
  type IconFamily,
  type IconStyle,
  IconStyleClassNameMap,
  IconFamilyClassNameMap,
  DEFAULT_ICON_FAMILY,
  DEFAULT_ICON_STYLE,
} from "./types";

export const getIconNameClassName = (name: IconName) => `fa-${name}`;

export const getIconFamilyClassName = (family: IconFamily = DEFAULT_ICON_FAMILY) =>
  IconFamilyClassNameMap[family];

export const getIconStyleClassName = (iconStyle: IconStyle = DEFAULT_ICON_STYLE) =>
  IconStyleClassNameMap[iconStyle];

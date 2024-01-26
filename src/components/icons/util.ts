import { type IconName } from "@fortawesome/fontawesome-svg-core";
import { z } from "zod";

import {
  type IconProp,
  IconFamilies,
  type IconFamily,
  type IconStyle,
  IconStyles,
  type IconComponentProps,
  type BasicIconComponentProps,
  IconStyleClassNameMap,
  IconFamilyClassNameMap,
  DEFAULT_ICON_FAMILY,
  DEFAULT_ICON_STYLE,
} from "./types";

const IconPropSchema = z.object({
  name: z.string(),
  family: z.nativeEnum(IconFamilies).optional(),
  iconStyle: z.nativeEnum(IconStyles).optional(),
});

export const isIconProp = (value: unknown): value is IconProp =>
  IconPropSchema.safeParse(value).success;

export const getIconNameClassName = (name: IconName) => `fa-${name}`;

export const getIconFamilyClassName = (family: IconFamily = DEFAULT_ICON_FAMILY) =>
  IconFamilyClassNameMap[family];

export const getIconStyleClassName = (iconStyle: IconStyle = DEFAULT_ICON_STYLE) =>
  IconStyleClassNameMap[iconStyle];

export const isBasicIconComponentProps = (
  params: IconComponentProps<IconProp>,
): params is BasicIconComponentProps<IconProp> =>
  (params as BasicIconComponentProps<IconProp>).icon !== undefined;

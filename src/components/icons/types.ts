import {
  type IconStyle as RootIconStyle,
  type IconFamily as RootIconFamily,
  type IconName as RootIconName,
} from "@fortawesome/fontawesome-svg-core";
import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import { z } from "zod";

export type IconName = RootIconName;

import { type ComponentProps } from "~/components/types";
import { type Size } from "~/components/types/sizes";

export const IconDimensions = enumeratedLiterals(["height", "width"] as const, {});
export type IconDimension = EnumeratedLiteralsMember<typeof IconDimensions>;

export const IconFits = enumeratedLiterals(["square", "fit"] as const, {});
export type IconFit = EnumeratedLiteralsMember<typeof IconFits>;

export const IconDiscreteSizes = enumeratedLiterals(
  ["xxs", "xs", "sm", "md", "lg", "xl", "xxl", "xxxl", "fill"] as const,
  {},
);

export type IconDiscreteSize = EnumeratedLiteralsMember<typeof IconDiscreteSizes>;
export type IconSize = IconDiscreteSize | Size;

export type IconFamily = Exclude<RootIconFamily, "duotone" | "sharp-duotone">;

export enum IconFamilies {
  CLASSIC = "classic",
  SHARP = "sharp",
}

export const IconFamilyClassNameMap: { [key in IconFamily]: string } = {
  classic: "",
  sharp: "fa-sharp",
};

export const DEFAULT_ICON_FAMILY = IconFamilies.CLASSIC;

export type IconStyle = Exclude<RootIconStyle, "duotone" | "light" | "thin">;

export enum IconStyles {
  SOLID = "solid",
  REGULAR = "regular",
  BRANDS = "brands",
}

export const DEFAULT_ICON_STYLE = IconStyles.REGULAR;

export const IconStyleClassNameMap: { [key in IconStyle]: string } = {
  regular: "fa-regular",
  solid: "fa-solid",
  brands: "fa-brands",
};

export type FontAwesomeIconProp = {
  readonly name: IconName;
  readonly family?: IconFamily;
  readonly iconStyle?: IconStyle;
};

export const FontAwesomeIconPropSchema = z.object({
  name: z.string(),
  family: z.nativeEnum(IconFamilies).optional(),
  iconStyle: z.nativeEnum(IconStyles).optional(),
});

export const isFontAwesomeIconProp = (value: unknown): value is FontAwesomeIconProp =>
  FontAwesomeIconPropSchema.safeParse(value).success;

export type SvgIconProp = `/${string}.svg`;

const SvgIconPropSchema = z.custom<SvgIconProp>(
  val => typeof val === "string" && val.startsWith("/") && val.endsWith(".svg"),
);

export const isSvgIconProp = (value: unknown): value is SvgIconProp =>
  SvgIconPropSchema.safeParse(value).success;

export const IconPropSchema = z.union([FontAwesomeIconPropSchema, SvgIconPropSchema]);

export const isIconProp = (value: unknown): value is IconProp =>
  IconPropSchema.safeParse(value).success;

/**
 * Defines the way that an "Icon" can be specified in the props for components in the application.
 */
export type IconProp = FontAwesomeIconProp | SvgIconProp;

type BaseIconProps = ComponentProps & {
  readonly size?: IconSize;
  readonly spinnerSize?: IconSize;
  /**
   * Whether or not the Icon should be rendered as a "loading" spinner.  Useful in cases where a
   * component contains an Icon but needs to replace it with a loading indicator when in a loading
   * state.
   */
  readonly isLoading?: boolean;
  readonly loadingClassName?: ComponentProps["className"];
  /**
   * A string, "fit" or "square", that defines whether or not the `svg` element should fit snuggly
   * around the inner `path` element of the Icon or SVG ("fit") or the `svg` element should have
   * a 1-1 aspect ratio, with its inner `path` element being centered in the containing `svg`
   * ("square").
   *
   * Default: "square"
   */
  readonly fit?: IconFit;
  /**
   * The dimension {@link IconDimension} that the Icon should be sized in based on the provided
   * `size` prop. An Icon must maintain its aspect-ratio, so it cannot size in both directions.
   *
   * Default: "height";
   */
  readonly dimension?: IconDimension;
};

export type BasicIconProps = BaseIconProps & {
  readonly family?: IconFamily;
  readonly iconStyle?: IconStyle;
  readonly icon: IconProp | IconName;
  readonly children?: never;
  readonly isDisabled?: boolean; // Not applicable if Icon is an SVG
};

export type ChildrenIconProps = BaseIconProps & {
  [key in keyof FontAwesomeIconProp]?: never;
} & {
  readonly family?: never;
  readonly iconStyle?: never;
  readonly icon?: never;
  /* If the icon is an SVG, instead of a Font Awesome configured icon, it can be passed to the
     component as a child. */
  readonly children: JSX.Element;
  readonly isDisabled?: never;
};

export type SpinnerProps = Omit<
  BasicIconProps,
  | "spin"
  | "icon"
  | "iconStyle"
  | "family"
  | "fit"
  | "isDisabled"
  | "visible"
  | "hidden"
  | "loadingClassName"
  | "spinnerSize"
>;

export type IconProps = ChildrenIconProps | BasicIconProps;

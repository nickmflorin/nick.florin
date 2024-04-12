import {
  type IconStyle as RootIconStyle,
  type IconFamily as RootIconFamily,
  type IconName,
} from "@fortawesome/fontawesome-svg-core";
import { z } from "zod";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import { type ComponentProps, type Size } from "~/components/types";

export const IconDimensions = enumeratedLiterals(["height", "width"] as const, {});
export type IconDimension = EnumeratedLiteralsType<typeof IconDimensions>;

export const IconFits = enumeratedLiterals(["square", "fit"] as const, {});
export type IconFit = EnumeratedLiteralsType<typeof IconFits>;

export const IconDiscreteSizes = enumeratedLiterals(
  ["xxs", "xs", "sm", "md", "lg", "xl", "fill"] as const,
  {},
);
export type IconDiscreteSize = EnumeratedLiteralsType<typeof IconDiscreteSizes>;
export type IconSize = IconDiscreteSize | Size;

export type IconFamily = Exclude<RootIconFamily, "duotone">;

export enum IconFamilies {
  CLASSIC = "classic",
  SHARP = "sharp",
}

export const IconFamilyClassNameMap: { [key in IconFamily]: string } = {
  classic: "",
  sharp: "fa-sharp",
};

export const DEFAULT_ICON_FAMILY = IconFamilies.SHARP;

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

export type DynamicIcon = {
  readonly icon: FontAwesomeIconProp;
  readonly visible: boolean;
};

/**
 * Represents an icon that can be dynamically changed due to user interaction after the first
 * render.
 *
 * see src/styles/globals/components/icons.scss for further information.
 *
 * Background:
 * ----------
 * The FontAwesome icon configuration works as follows:
 *
 * (1) The FontAwesome pro script is loaded via a <Script />
 * (2) The script looks for <i> tags with the proper icon class name (i.e. fa-chevron-up) and nests
 *     an <svg> tag inside of the <i> tag, with the same attributes as the <i> tag (i.e. class name,
 *     style, etc.)
 *
 * This is done so that FontAwesome can *only* load the necessary CSS and SVGs for the icons that
 * are actually used in the application.  This also means that it will only load the necessary CSS
 * and SVGs for the icons that are defined when the elements are first rendered.
 *
 * Problem:
 * --------
 * What is the problem with this?  The problem is that it prevents icons from changing after the
 * first render, particularly as it relates to user interaction.  If a component uses two different
 * icons, where the second icon may not be shown until after the first render when the user
 * interacts with the component, not only will the second icon not be loaded by FontAwesome
 * initially - or at all - but the <svg> class name will indicate the original icon that was
 * rendered, even if the <i> class name changes.
 *
 * For example, if we consider a button that toggles the icon between "chevron-up" and
 * "chevron-down" when it is clicked, the HTML structure will exhibit the following behavior:
 *
 * // Before User Interaction & Before Font Awesome Loads
 * <button>
 *   <i class="fa fa-chevron-up" />
 * </button>
 *
 * // Before User Interaction but After Font Awesome Loads
 * <button>
 *   <i class="fa fa-chevron-up">
 *     <svg class="fa fa-chevron-up" /> // This is responsible for rendering the actual Icon.
 *   </i>
 * </button>
 *
 * // After User Interaction and After Font Awesome Loads
 * <button>
 *   <i class="fa fa-chevron-down">
 *     <svg class="fa fa-chevron-up" /> // This is responsible for rendering the actual Icon.
 *   </i>
 * </button>
 *
 * Note how after the user clicks the button, the class on the <i> tags changes appropriately (this
 * is because our Icon component is responsible for that class name,  based on the 'icon' prop).
 * However, the underlying svg class name does not change - this is because the svg is populated by
 * FontAwesome when it first loads the script.  The resulting effect is that the actual icon that is
 * rendered will not change - because the class on the <i> tag is only used by FontAwesome to define
 * the class on the <svg> when it is initially rendered - but does not change the svg class name
 * after the fact.
 *
 * Solution
 * --------
 * The solution to this problem is that when a component uses multiple icons and the icon may change
 * after the first render, it has to render both of them - but apply "display: none" to the icon or
 * icon(s) that are not currently being shown.  When the interaction occurs, such as a button click,
 * the Icon component will then toggle which <i> element has the "display: none" style attribute.
 *
 * // Before User Interaction & Before Font Awesome Loads
 * <button>
 *   <i class="fa fa-chevron-up" />
 * </button>
 *
 * // Before User Interaction but After Font Awesome Loads
 * <button>
 *   <i class="fa fa-chevron-up">
 *     <svg class="fa fa-chevron-up" />
 *   </i>
 *   <i class="fa fa-chevron-down" style="display: none;">
 *     // Style attribute is copied to the nested svg.
 *     <svg class="fa fa-chevron-down" style="display: none;" />
 *   </i>
 * </button>
 *
 * However, since FontAwesome will copy all of the attributes on the <i> element to the nested <svg>
 * element, when we remove or add the "display: none" tag on the <i> element, it will not have the
 * same effect on the nested <svg>.  To fix this, we need to add "!important" to the
 * "display: inherit" style on the <svg> element - ensuring that when the <i> element is hidden or
 * shown, the nested <svg> element will also be hidden or shown - and since the <svg> is rendered in
 * the DOM (but just hidden), the icon will appropriately change after user interaction occurs.
 *
 * // After User Interaction and After Font Awesome Loads
 * <button>
 *   <i class="fa fa-chevron-up" style="display: none;">
 *     // Display none is still not inlined, but the important flag overrides.
 *     <svg class="fa fa-chevron-up" />
 *   </i>
 *   <i class="fa fa-chevron-down">
 *     // Display none is still inlined, but the important flag overrides.
 *     <svg class="fa fa-chevron-down" style="display: none;"/>
 *   </i>
 * </button>
 *
 * This type is then used to represent an icon that should be rendered in the DOM, but only shown
 * when the conditional evaluates to true - allowing the icon to be loaded by FontAwesome's script
 * while also allowing the icon to be dynamically visible.
 */
export type DynamicIconProp = DynamicIcon[];

export const DynamicIconPropSchema = z.array(
  z.object({
    icon: FontAwesomeIconPropSchema,
    visible: z.boolean(),
  }),
);

export const isDynamicIconProp = (value: unknown): value is DynamicIconProp =>
  DynamicIconPropSchema.safeParse(value).success;

export const IconPropSchema = z.union([
  FontAwesomeIconPropSchema,
  DynamicIconPropSchema,
  SvgIconPropSchema,
]);

export const isIconProp = (value: unknown): value is IconProp =>
  IconPropSchema.safeParse(value).success;

/**
 * Defines the way that an "Icon" can be specified in the props for components in the application.
 */
export type IconProp = DynamicIconProp | FontAwesomeIconProp | SvgIconProp;

type BaseIconProps = ComponentProps & {
  /**
   * Whether or not the Icon should be rendered as a "loading" spinner.  Useful in cases where a
   * component contains an Icon but needs to replace it with a loading indicator when in a loading
   * state.
   */
  readonly isLoading?: boolean;
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

type IfDynamic<T, I extends IconProp, R = never> = I extends DynamicIconProp ? T : R;
type IfSvg<T, I extends IconProp, R = never> = I extends SvgIconProp ? T : R;

export type BasicIconProps<I extends IconProp = FontAwesomeIconProp> = BaseIconProps & {
  [key in keyof FontAwesomeIconProp]?: never;
} & {
  readonly icon: I;
  readonly children?: never;
  readonly size?: IfSvg<number, I, IconSize>;
  /**
   * Used to control dynamically rendered icons.
   *
   * @see DynamicIconProp;
   */
  readonly visible?: IfDynamic<never, I, boolean>;
  readonly hidden?: IfDynamic<never, I, boolean>;
  readonly isDisabled?: IfSvg<never, I, boolean>;
};

export type EmbeddedIconProps = BaseIconProps &
  FontAwesomeIconProp & {
    readonly size?: IconSize;
    readonly icon?: never;
    readonly children?: never;
    readonly hidden?: boolean;
    readonly visible?: boolean;
    readonly isDisabled?: boolean;
  };

export type ChildrenIconProps = BaseIconProps & {
  [key in keyof FontAwesomeIconProp]?: never;
} & {
  readonly size?: IconSize;
  readonly icon?: never;
  /* If the icon is an SVG, instead of a Font Awesome configured icon, it can be passed to the
     component as a child. */
  readonly children: JSX.Element;
  readonly hidden?: boolean;
  readonly visible?: boolean;
  readonly isDisabled?: never;
};

export type SpinnerProps = Omit<
  BasicIconProps<FontAwesomeIconProp>,
  "spin" | "icon" | "fit" | "isDisabled" | "visible" | "hidden"
>;

export type IconProps =
  | EmbeddedIconProps
  | ChildrenIconProps
  | BasicIconProps<SvgIconProp>
  | BasicIconProps<IconProp>
  | BasicIconProps<DynamicIconProp>;

export type IconElement = React.ReactElement<IconProps>;

export type MultipleIconProp<
  T extends IconProp | DynamicIconProp | IconElement = IconProp | DynamicIconProp | IconElement,
> = T | { left?: T; right: T };

export const parseMultipleIconProp = <T extends IconProp | DynamicIconProp | IconElement>(
  prop: MultipleIconProp<T>,
  location: "left" | "right",
): T | null => {
  if (typeof prop === "object" && prop !== null && (prop as { right: T }).right !== undefined) {
    return location === "left" ? (prop as { left?: T }).left || null : (prop as { right: T }).right;
  } else if (location === "left") {
    return prop as T;
  }
  return null;
};

export const parseMultipleIconsProp = <T extends IconProp | DynamicIconProp | IconElement>(
  prop: MultipleIconProp<T>,
): [T | null, T | null] => [
  parseMultipleIconProp(prop, "left"),
  parseMultipleIconProp(prop, "right"),
];

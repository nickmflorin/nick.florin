import { type JSX } from 'react';

import {
  type IconFamily as RootIconFamily,
  type IconStyle as RootIconStyle,
} from '@fortawesome/fontawesome-svg-core';
import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';
import { z } from 'zod';

import { type ComponentProps } from '~/components/types';
import { type QuantitativeSize } from '~/components/types/sizes';

import { type RegisteredIconName } from './registry';

/**
 * The names of the Font Awesome icons that can be rendered in the application.
 *
 * The union is derived from the icon registries in `./registry.ts`, which bundle the icon SVGs
 * directly (there is no kit script loading icons at runtime), so a name outside the registries is
 * a compile error at the call site rather than an icon that silently fails to render.
 */
export type IconName = RegisteredIconName;

export const IconDimensions = enumeratedLiterals(['height', 'width'] as const, {});
export type IconDimension = EnumeratedLiteralsMember<typeof IconDimensions>;

export const IconFits = enumeratedLiterals(['square', 'fit'] as const, {});
export type IconFit = EnumeratedLiteralsMember<typeof IconFits>;

export const IconDiscreteSizes = enumeratedLiterals(
  ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'fill'] as const,
  {},
);

export type IconDiscreteSize = EnumeratedLiteralsMember<typeof IconDiscreteSizes>;
export type IconSize = IconDiscreteSize | QuantitativeSize<'px'>;

export type IconFamily = Exclude<RootIconFamily, 'duotone' | 'sharp-duotone'>;

export enum IconFamilies {
  CLASSIC = 'classic',
  SHARP = 'sharp',
}

export const DEFAULT_ICON_FAMILY = IconFamilies.CLASSIC;

export type IconStyle = Exclude<RootIconStyle, 'duotone' | 'light' | 'thin'>;

export enum IconStyles {
  BRANDS = 'brands',
  REGULAR = 'regular',
  SOLID = 'solid',
}

export const DEFAULT_ICON_STYLE = IconStyles.REGULAR;

export type FontAwesomeIconProp = {
  readonly family?: IconFamily;
  readonly iconStyle?: IconStyle;
  readonly name: IconName;
};

export const FontAwesomeIconPropSchema = z.object({
  family: z.nativeEnum(IconFamilies).optional(),
  iconStyle: z.nativeEnum(IconStyles).optional(),
  name: z.string(),
});

export const isFontAwesomeIconProp = (value: unknown): value is FontAwesomeIconProp =>
  FontAwesomeIconPropSchema.safeParse(value).success;

export type SvgIconProp = `/${string}.svg`;

const SvgIconPropSchema = z.custom<SvgIconProp>(
  val => typeof val === 'string' && val.startsWith('/') && val.endsWith('.svg'),
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

type BaseIconProps = {
  /**
   * The dimension {@link IconDimension} that the Icon should be sized in based on the provided
   * `size` prop. An Icon must maintain its aspect-ratio, so it cannot size in both directions.
   *
   * @default 'height'
   */
  readonly dimension?: IconDimension;
  /**
   * A string, "fit" or "square", that defines whether or not the `svg` element should fit snuggly
   * around the inner `path` element of the Icon or SVG ("fit") or the `svg` element should have
   * a 1-1 aspect ratio, with its inner `path` element being centered in the containing `svg`
   * ("square").
   *
   * @default 'square'
   */
  readonly fit?: IconFit;
  /**
   * Whether or not the Icon should be rendered as a "loading" spinner. Useful in cases where a
   * component contains an Icon but needs to replace it with a loading indicator when in a loading
   * state.
   */
  readonly isLoading?: boolean;
  readonly size?: IconSize;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: IconSize;
} & ComponentProps;

export type BasicIconProps = {
  readonly children?: never;
  readonly family?: IconFamily;
  readonly icon: IconName | IconProp;
  readonly iconStyle?: IconStyle;
  /**
   * Not applicable if the icon is an SVG.
   */
  readonly isDisabled?: boolean;
} & BaseIconProps;

export type ChildrenIconProps = {
  /**
   * If the icon is an SVG, instead of a Font Awesome configured icon, it can be passed to the
   * component as a child.
   */
  readonly children: JSX.Element;
  readonly family?: never;
  readonly icon?: never;
  readonly iconStyle?: never;
  readonly isDisabled?: never;
} & {
  [key in keyof FontAwesomeIconProp]?: never;
} & BaseIconProps;

export type SpinnerProps = Omit<
  BasicIconProps,
  | 'family'
  | 'fit'
  | 'hidden'
  | 'icon'
  | 'iconStyle'
  | 'isDisabled'
  | 'spin'
  | 'spinnerClassName'
  | 'spinnerSize'
  | 'visible'
>;

export type IconProps = BasicIconProps | ChildrenIconProps;

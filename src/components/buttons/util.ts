import { type QuantitativeSizeString, sizeToString } from '~/components/types';

import * as types from './types';

/**
 * Converts the provided icon size to a string size (e.g. "32px") when it is non discrete, returning
 * `undefined` otherwise.
 *
 * If the icon size corresponds to a discrete size, it will be set with a class name by the abstract
 * form of the button.  Otherwise, the size has to be provided directly to the Icon component, in
 * the case that it is non discrete (e.g. 32px, not "small").
 */
export const toIconSize = (
  size: types.ButtonIconSize | undefined,
): QuantitativeSizeString<'px'> | undefined =>
  size !== undefined && !types.ButtonDiscreteIconSizes.contains(size)
    ? sizeToString(size, 'px')
    : undefined;

/**
 * Returns the provided icon size only if it conforms to a standardized, discrete size option (e.g.
 * "sm", "md", "lg", etc.), such that it can be included as a data attribute on the button.  If it
 * does not, it is a numeric size, and should be incorporated into the element via inline styles.
 */
export const toDiscreteIconSize = (
  size: types.ButtonIconSize | undefined,
): types.ButtonDiscreteIconSize | undefined =>
  size !== undefined && types.ButtonDiscreteIconSizes.contains(size) ? size : undefined;

/**
 * Returns the provided size only if it conforms to a standardized, discrete size option (e.g.
 * "sm", "md", "lg", etc.), such that it can be included as a data attribute on the button.  If it
 * does not, it is a numeric size, and should be incorporated into the element via inline styles.
 */
export const toDiscreteSize = (
  size: types.ButtonSize | undefined,
): types.ButtonDiscreteSize | undefined => {
  const base = types.isResponsiveButtonSize(size) ? size.base : size;
  return base !== undefined && types.ButtonDiscreteSizes.contains(base) ? base : undefined;
};

/**
 * Returns the per-breakpoint size data attributes for a responsive size, which the stylesheet
 * matches inside the corresponding media queries, and nothing for a size that does not vary.
 *
 * The `satisfies` clause is what keeps this in step with {@link types.ButtonResponsiveBreakpoints}:
 * adding a breakpoint there fails to compile here until it is handled.
 */
export const getResponsiveButtonSizeAttributes = (size: types.ButtonSize | undefined) =>
  types.isResponsiveButtonSize(size)
    ? ({ sizeLg: size.lg, sizeMd: size.md, sizeSm: size.sm } satisfies Record<
        `size${Capitalize<types.ButtonResponsiveBreakpoint>}`,
        types.ButtonDiscreteSize | undefined
      >)
    : {};

export type ButtonSizeStyleProps = {
  readonly size?: types.ButtonSize;
};

/* A discrete size is carried by a data attribute and styled from the `$button-sizes` map, and a
   responsive size is carried by one attribute per breakpoint. Only a raw pixel size has to be
   written as an inline style. */
export const getButtonSizeStyle = (props: ButtonSizeStyleProps) =>
  props.size !== undefined &&
  !types.isResponsiveButtonSize(props.size) &&
  !types.ButtonDiscreteSizes.contains(props.size)
    ? {
        height: sizeToString(props.size, 'px'),
        minHeight: sizeToString(props.size, 'px'),
      }
    : {};

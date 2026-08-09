import { type UrlObject } from 'url';

import { type LinkProps as NextLinkProps } from 'next/link';
import {
  type ForwardedRef,
  type JSX,
  type ComponentProps as ReactComponentProps,
  type FocusEventHandler as ReactFocusEventHandler,
  type MouseEventHandler as ReactMouseEventHandler,
  type ReactNode,
  type PointerEventHandler as ReactPointerEventHandler,
} from 'react';

import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type IconName, type IconProp } from '~/components/icons';
import { type BorderRadius, type ComponentProps, type QuantitativeSize } from '~/components/types';

export const ButtonLoadingLocations = enumeratedLiterals(['left', 'over', 'right'] as const, {});
export type ButtonLoadingLocation = EnumeratedLiteralsMember<typeof ButtonLoadingLocations>;

export const ButtonTypes = enumeratedLiterals(
  ['button', 'icon-button', 'link', 'inline-link'] as const,
  {},
);
export type ButtonType = EnumeratedLiteralsMember<typeof ButtonTypes>;

export const ButtonColorSchemes = enumeratedLiterals(
  ['primary', 'danger', 'light', 'success', 'secondary'] as const,
  {},
);
export type ButtonColorScheme = EnumeratedLiteralsMember<typeof ButtonColorSchemes>;

export const ButtonButtonVariants = enumeratedLiterals(
  ['solid', 'outlined', 'transparent'] as const,
  {},
);
export type ButtonButtonVariant = EnumeratedLiteralsMember<typeof ButtonButtonVariants>;

export const IconButtonVariants = enumeratedLiterals(
  ['solid', 'outlined', 'transparent'] as const,
  {},
);
export type IconButtonVariant = EnumeratedLiteralsMember<typeof IconButtonVariants>;

export const ButtonVariants = {
  button: ButtonButtonVariants,
  'icon-button': IconButtonVariants,
};

export const ButtonDiscreteSizes = enumeratedLiterals(
  ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const,
  {},
);
export type ButtonDiscreteSize = EnumeratedLiteralsMember<typeof ButtonDiscreteSizes>;

/**
 * The breakpoints at which a button may change size.
 *
 * Deliberately a subset of the theme's screens. Each entry multiplies the size rules the stylesheet
 * generates, and a button that restyles itself at more than a couple of widths is usually two
 * different buttons wearing one name.
 */
export const ButtonResponsiveBreakpoints = enumeratedLiterals(['sm', 'md', 'lg'] as const, {});
export type ButtonResponsiveBreakpoint = EnumeratedLiteralsMember<
  typeof ButtonResponsiveBreakpoints
>;

/**
 * A size that changes with the viewport: `base` applies below the smallest breakpoint given, and
 * each breakpoint applies from its own minimum width upward.
 *
 * Only discrete sizes participate, so that every dimension the size implies keeps being derived
 * from the `$button-sizes` map rather than restated as pixels at the call site.
 */
export type ButtonResponsiveSize = {
  readonly base: ButtonDiscreteSize;
} & Partial<Record<ButtonResponsiveBreakpoint, ButtonDiscreteSize>>;

export type ButtonSize = ButtonDiscreteSize | ButtonResponsiveSize | QuantitativeSize<'px'>;

export const isResponsiveButtonSize = (
  size: ButtonSize | undefined,
): size is ButtonResponsiveSize => typeof size === 'object';

export const ButtonDiscreteIconSizes = enumeratedLiterals(
  ['xsmall', 'small', 'medium', 'large', 'xlarge', 'full'] as const,
  {},
);
export type ButtonDiscreteIconSize = EnumeratedLiteralsMember<typeof ButtonDiscreteIconSizes>;

export type ButtonIconSize = ButtonDiscreteIconSize | QuantitativeSize<'px'>;

export const ButtonElements = enumeratedLiterals(['button', 'a', 'div', 'link'] as const, {});
export type ButtonElement = EnumeratedLiteralsMember<typeof ButtonElements>;

export type NativeButtonProps<E extends ButtonElement> = E extends 'button'
  ? ReactComponentProps<'button'>
  : E extends 'a'
    ? ReactComponentProps<'a'>
    : E extends 'div'
      ? ReactComponentProps<'div'>
      : E extends 'link'
        ? NextLinkProps
        : never;

export type PolymorphicButtonElement<E extends ButtonElement> = {
  a: HTMLAnchorElement;
  button: HTMLButtonElement;
  div: HTMLDivElement;
  link: HTMLAnchorElement;
}[E];

export type PolymorphicButtonRef<E extends ButtonElement> = {
  a: ForwardedRef<HTMLAnchorElement>;
  button: ForwardedRef<HTMLButtonElement>;
  div: ForwardedRef<HTMLDivElement>;
  link: ForwardedRef<HTMLAnchorElement>;
}[E];

export type ButtonIconProp<
  T extends IconName | IconProp | JSX.Element = IconName | IconProp | JSX.Element,
> = { left?: T; right: T } | T;

export const parseButtonIcon = <T extends IconName | IconProp | JSX.Element>(
  prop: ButtonIconProp<T>,
  location: 'left' | 'right',
): null | T => {
  if (typeof prop === 'object' && (prop as { right?: T }).right !== undefined) {
    return location === 'left'
      ? ((prop as { left?: T }).left ?? null)
      : (prop as { right: T }).right;
  } else if (location === 'left') {
    return prop as T;
  }
  return null;
};

export const parseButtonIcons = <T extends IconName | IconProp | JSX.Element>(
  prop: ButtonIconProp<T>,
): [null | T, null | T] => [parseButtonIcon(prop, 'left'), parseButtonIcon(prop, 'right')];

type IfAnchorElement<E extends ButtonElement> = E extends 'a' ? boolean : never;

export type MouseEventHandler<E extends ButtonElement> = E extends 'button'
  ? ReactMouseEventHandler<HTMLButtonElement>
  : E extends 'div'
    ? ReactMouseEventHandler<HTMLDivElement>
    : E extends 'a'
      ? ReactMouseEventHandler<HTMLAnchorElement>
      : E extends 'link'
        ? ReactMouseEventHandler<HTMLAnchorElement>
        : never;

export type FocusEventHandler<E extends ButtonElement> = E extends 'button'
  ? ReactFocusEventHandler<HTMLButtonElement>
  : E extends 'div'
    ? ReactFocusEventHandler<HTMLDivElement>
    : E extends 'a'
      ? ReactFocusEventHandler<HTMLAnchorElement>
      : E extends 'link'
        ? ReactFocusEventHandler<HTMLAnchorElement>
        : never;

export type PointerEventHandler<E extends ButtonElement> = E extends 'button'
  ? ReactPointerEventHandler<HTMLButtonElement>
  : E extends 'div'
    ? ReactPointerEventHandler<HTMLDivElement>
    : E extends 'a'
      ? ReactPointerEventHandler<HTMLAnchorElement>
      : E extends 'link'
        ? ReactPointerEventHandler<HTMLAnchorElement>
        : never;

export type ButtonSubmitType<E extends ButtonElement> = E extends 'button'
  ? 'button' | 'submit'
  : never;

export type ButtonHref<E extends ButtonElement> = E extends 'a' | 'link'
  ? string | UrlObject
  : never;

export type ButtonRel<E extends ButtonElement> = E extends 'a' ? string : never;

export type ButtonTarget<E extends ButtonElement> = E extends 'a' ? string : never;

export interface AbstractInternalButtonProps<E extends ButtonElement> extends ComponentProps {
  readonly activeClassName?: ComponentProps['className'];
  readonly buttonType: ButtonType;
  readonly disabledClassName?: ComponentProps['className'];
  readonly element?: E;
  readonly isActive?: boolean;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  /**
   * Sets the element in a "locked" state, which is a state in which the non-visual characteristics
   * of the "disabled" state will be used, but the element will not appear as if it is "disabled".
   *
   * In other words, the element will prevent click/interaction events, but it will appear as if
   * it is in a normal state.
   *
   * This prop should be used for cases where the click behavior of the element should be
   * restricted, but we do not want to treat the element, visually, as being disabled.  For
   * instance, if the element is in a "loading" state, we do not want it to look as if it is
   * disabled - but we do not want to allow click events.
   */
  readonly isLocked?: boolean;
  readonly loadingClassName?: ComponentProps['className'];
  readonly lockedClassName?: ComponentProps['className'];
  readonly openInNewTab?: IfAnchorElement<E>;
  readonly radius?: BorderRadius;
  readonly scheme?: ButtonColorScheme;
  readonly tourId?: string;
}

export interface AbstractButtonProps<
  E extends ButtonElement,
> extends AbstractInternalButtonProps<E> {
  readonly children?: ReactNode;
  readonly href?: ButtonHref<E>;
  readonly id?: string;
  readonly onBlur?: FocusEventHandler<E>;
  readonly onClick?: MouseEventHandler<E>;
  readonly onFocus?: FocusEventHandler<E>;
  readonly onMouseEnter?: MouseEventHandler<E>;
  readonly onMouseLeave?: MouseEventHandler<E>;
  readonly onMouseMove?: MouseEventHandler<E>;
  readonly onPointerDown?: PointerEventHandler<E>;
  readonly onPointerEnter?: PointerEventHandler<E>;
  readonly rel?: ButtonRel<E>;
  readonly target?: ButtonTarget<E>;
  readonly type?: ButtonSubmitType<E>;
}

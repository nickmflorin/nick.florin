import { type UrlObject } from "url";

import { type LinkProps as NextLinkProps } from "next/link";
import type React from "react";
import { type ForwardedRef } from "react";

import { type EnumeratedLiteralsMember, enumeratedLiterals } from "enumerated-literals";

import { type IconProp, type IconName } from "~/components/icons";
import { type BorderRadius, type ComponentProps, type QuantitativeSize } from "~/components/types";

export const ButtonLoadingLocations = enumeratedLiterals(["left", "over", "right"] as const, {});
export type ButtonLoadingLocation = EnumeratedLiteralsMember<typeof ButtonLoadingLocations>;

export const ButtonTypes = enumeratedLiterals(
  ["button", "icon-button", "link", "inline-link"] as const,
  {},
);
export type ButtonType = EnumeratedLiteralsMember<typeof ButtonTypes>;

export const ButtonColorSchemes = enumeratedLiterals(
  ["primary", "danger", "light", "success", "secondary"] as const,
  {},
);
export type ButtonColorScheme = EnumeratedLiteralsMember<typeof ButtonColorSchemes>;

export const ButtonButtonVariants = enumeratedLiterals(
  ["solid", "outlined", "transparent"] as const,
  {},
);
export type ButtonButtonVariant = EnumeratedLiteralsMember<typeof ButtonButtonVariants>;

export const IconButtonVariants = enumeratedLiterals(
  ["solid", "outlined", "transparent"] as const,
  {},
);
export type IconButtonVariant = EnumeratedLiteralsMember<typeof IconButtonVariants>;

export const ButtonVariants = {
  button: ButtonButtonVariants,
  "icon-button": IconButtonVariants,
};

export const ButtonDiscreteSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge"] as const,
  {},
);
export type ButtonDiscreteSize = EnumeratedLiteralsMember<typeof ButtonDiscreteSizes>;

export type ButtonSize = ButtonDiscreteSize | QuantitativeSize<"px">;

export const ButtonDiscreteIconSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge", "full"] as const,
  {},
);
export type ButtonDiscreteIconSize = EnumeratedLiteralsMember<typeof ButtonDiscreteIconSizes>;

// Represents the size of the Icon inside of the Button.
export type ButtonIconSize = ButtonDiscreteIconSize | QuantitativeSize<"px">;

export const ButtonElements = enumeratedLiterals(["button", "a", "div", "link"] as const, {});
export type ButtonElement = EnumeratedLiteralsMember<typeof ButtonElements>;

export type NativeButtonProps<E extends ButtonElement> = E extends "button"
  ? React.ComponentProps<"button">
  : E extends "a"
    ? React.ComponentProps<"a">
    : E extends "div"
      ? React.ComponentProps<"div">
      : E extends "link"
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
  T extends IconProp | IconName | JSX.Element = IconProp | IconName | JSX.Element,
> = T | { left?: T; right: T };

export const parseButtonIcon = <T extends IconProp | IconName | JSX.Element>(
  prop: ButtonIconProp<T>,
  location: "left" | "right",
): T | null => {
  if (typeof prop === "object" && prop !== null && (prop as { right: T }).right !== undefined) {
    return location === "left" ? (prop as { left?: T }).left || null : (prop as { right: T }).right;
  } else if (location === "left") {
    return prop as T;
  }
  return null;
};

export const parseButtonIcons = <T extends IconProp | IconName | JSX.Element>(
  prop: ButtonIconProp<T>,
): [T | null, T | null] => [parseButtonIcon(prop, "left"), parseButtonIcon(prop, "right")];

type IfAnchorElement<E extends ButtonElement> = E extends "a" ? boolean : never;

export type MouseEventHandler<E extends ButtonElement> = E extends "button"
  ? React.MouseEventHandler<HTMLButtonElement>
  : E extends "div"
    ? React.MouseEventHandler<HTMLDivElement>
    : E extends "a"
      ? React.MouseEventHandler<HTMLAnchorElement>
      : E extends "link"
        ? React.MouseEventHandler<HTMLAnchorElement>
        : never;

export type FocusEventHandler<E extends ButtonElement> = E extends "button"
  ? React.FocusEventHandler<HTMLButtonElement>
  : E extends "div"
    ? React.FocusEventHandler<HTMLDivElement>
    : E extends "a"
      ? React.FocusEventHandler<HTMLAnchorElement>
      : E extends "link"
        ? React.FocusEventHandler<HTMLAnchorElement>
        : never;

export type PointerEventHandler<E extends ButtonElement> = E extends "button"
  ? React.PointerEventHandler<HTMLButtonElement>
  : E extends "div"
    ? React.PointerEventHandler<HTMLDivElement>
    : E extends "a"
      ? React.PointerEventHandler<HTMLAnchorElement>
      : E extends "link"
        ? React.PointerEventHandler<HTMLAnchorElement>
        : never;

export type ButtonSubmitType<E extends ButtonElement> = E extends "button"
  ? "button" | "submit"
  : never;

export type ButtonHref<E extends ButtonElement> = E extends "a" | "link"
  ? UrlObject | string
  : never;

export type ButtonRel<E extends ButtonElement> = E extends "a" ? string : never;

export type ButtonTarget<E extends ButtonElement> = E extends "a" ? string : never;

export interface AbstractInternalButtonProps<E extends ButtonElement> extends ComponentProps {
  readonly buttonType: ButtonType;
  readonly element?: E;
  readonly scheme?: ButtonColorScheme;
  readonly openInNewTab?: IfAnchorElement<E>;
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
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
  readonly isActive?: boolean;
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly activeClassName?: ComponentProps["className"];
  readonly radius?: BorderRadius;
  readonly tourId?: string;
}

export interface AbstractButtonProps<E extends ButtonElement>
  extends AbstractInternalButtonProps<E> {
  readonly id?: string;
  readonly children?: React.ReactNode;
  readonly type?: ButtonSubmitType<E>;
  readonly href?: ButtonHref<E>;
  readonly target?: ButtonTarget<E>;
  readonly rel?: ButtonRel<E>;
  readonly onClick?: MouseEventHandler<E>;
  readonly onMouseEnter?: MouseEventHandler<E>;
  readonly onMouseMove?: MouseEventHandler<E>;
  readonly onMouseLeave?: MouseEventHandler<E>;
  readonly onBlur?: FocusEventHandler<E>;
  readonly onFocus?: FocusEventHandler<E>;
  readonly onPointerDown?: PointerEventHandler<E>;
  readonly onPointerEnter?: PointerEventHandler<E>;
}

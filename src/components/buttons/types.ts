import { type LinkProps as NextLinkProps } from "next/link";
import { type ReactNode, type ForwardedRef } from "react";

import { type EnumeratedLiteralsType, enumeratedLiterals } from "~/lib/literals";
import {
  type Size,
  type ComponentProps,
  type HTMLElementProps,
  type BaseTypographyProps,
} from "~/components/types";

export const ButtonLoadingLocations = enumeratedLiterals(["left", "over", "right"] as const, {});
export type ButtonLoadingLocation = EnumeratedLiteralsType<typeof ButtonLoadingLocations>;

export const ButtonButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "danger"] as const,
  {},
);
export type ButtonButtonVariant = EnumeratedLiteralsType<typeof ButtonButtonVariants>;

export const IconButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "transparent", "danger", "light"] as const,
  {},
);
export type IconButtonVariant = EnumeratedLiteralsType<typeof IconButtonVariants>;

export const LinkVariants = enumeratedLiterals(["primary", "secondary", "danger"] as const, {});
export type LinkVariant = EnumeratedLiteralsType<typeof LinkVariants>;

export type ButtonVariant<T extends ButtonType> = {
  button: ButtonButtonVariant;
  "icon-button": IconButtonVariant;
  link: LinkVariant;
}[T];

export const ButtonVariants = {
  button: ButtonButtonVariants,
  "icon-button": IconButtonVariants,
  link: LinkVariants,
};

export const ButtonDiscreteSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge"] as const,
  {},
);
export type ButtonDiscreteSize = EnumeratedLiteralsType<typeof ButtonDiscreteSizes>;

export type IconButtonSize = ButtonDiscreteSize | Size;

export type ButtonSize<T extends ButtonType> = {
  button: ButtonDiscreteSize;
  "icon-button": IconButtonSize;
  link: never;
}[T];

export const ButtonDiscreteIconSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge", "full"] as const,
  {},
);
export type ButtonDiscreteIconSize = EnumeratedLiteralsType<typeof ButtonDiscreteIconSizes>;

export type ButtonIconSize = ButtonDiscreteIconSize | Size;

export const ButtonTypes = enumeratedLiterals(["button", "icon-button", "link"] as const, {});
export type ButtonType = EnumeratedLiteralsType<typeof ButtonTypes>;

export const ButtonForms = enumeratedLiterals(["button", "a", "link"] as const, {});
export type ButtonForm = EnumeratedLiteralsType<typeof ButtonForms>;

type IfButtonOrLink<V, T extends ButtonType, R = never> = T extends "button" | "link" ? V : R;

type ButtonFontSize<T extends ButtonType> = {
  button: ButtonSize<"button">;
  "icon-button": never;
  link: BaseTypographyProps["fontSize"];
}[T];

export type AbstractProps<T extends ButtonType, F extends ButtonForm> = ComponentProps & {
  readonly buttonType: T;
  readonly as?: F;
  readonly variant?: ButtonVariant<T>;
  readonly fontFamily?: IfButtonOrLink<BaseTypographyProps["fontFamily"], T, never>;
  readonly fontWeight?: IfButtonOrLink<BaseTypographyProps["fontWeight"], T, never>;
  readonly transform?: IfButtonOrLink<BaseTypographyProps["transform"], T, never>;
  readonly fontSize?: ButtonFontSize<T>;
  /**
   * Sets the element in a "locked" state, which is a state in which the non-visual
   * characteristics of the "disabled" state should be used, but the element should not be
   * styled as if it is disabled.
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
  readonly size?: ButtonSize<T>;
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly activeClassName?: ComponentProps["className"];
  readonly children: ReactNode;
  readonly iconSize?: ButtonIconSize;
} & PolymorphicAbstractButtonProps<F>;

type CommonEventProps =
  | "onMouseEnter"
  | "onMouseLeave"
  | "onFocus"
  | "onBlur"
  | "onPointerDown"
  | "onPointerEnter"
  | "onMouseMove"
  | "onClick";

export type AbstractButtonProps = Pick<HTMLElementProps<"button">, CommonEventProps> & {
  readonly type?: "submit" | "button";
};

export type AbstractLinkProps = Pick<
  NextLinkProps,
  "href" | (CommonEventProps & keyof NextLinkProps)
>;

export type AbstractAnchorProps = Pick<HTMLElementProps<"a">, CommonEventProps> & {
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
};

export type PolymorphicAbstractButtonProps<F extends ButtonForm> = {
  link: AbstractLinkProps;
  button: AbstractButtonProps;
  a: AbstractAnchorProps;
}[F];

export type PolymorphicButtonElement<F extends ButtonForm> = {
  link: HTMLAnchorElement;
  a: HTMLAnchorElement;
  button: HTMLButtonElement;
}[F];

export type PolymorphicButtonRef<F extends ButtonForm> = {
  link: ForwardedRef<HTMLAnchorElement>;
  a: ForwardedRef<HTMLAnchorElement>;
  button: ForwardedRef<HTMLButtonElement>;
}[F];

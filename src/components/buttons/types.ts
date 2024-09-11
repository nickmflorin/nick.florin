import { type LinkProps as NextLinkProps } from "next/link";
import { type ReactNode, type ForwardedRef } from "react";

import { type EnumeratedLiteralsMember, enumeratedLiterals } from "enumerated-literals";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import { type Size } from "~/components/types/sizes";
import { type TypographyCharacteristics } from "~/components/types/typography";

export const ButtonLoadingLocations = enumeratedLiterals(["left", "over", "right"] as const, {});
export type ButtonLoadingLocation = EnumeratedLiteralsMember<typeof ButtonLoadingLocations>;

export const ButtonButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "danger"] as const,
  {},
);
export type ButtonButtonVariant = EnumeratedLiteralsMember<typeof ButtonButtonVariants>;

export const IconButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "transparent", "danger", "light"] as const,
  {},
);
export type IconButtonVariant = EnumeratedLiteralsMember<typeof IconButtonVariants>;

export const LinkVariants = enumeratedLiterals(["primary", "secondary", "danger"] as const, {});
export type LinkVariant = EnumeratedLiteralsMember<typeof LinkVariants>;

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
export type ButtonDiscreteSize = EnumeratedLiteralsMember<typeof ButtonDiscreteSizes>;

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
export type ButtonDiscreteIconSize = EnumeratedLiteralsMember<typeof ButtonDiscreteIconSizes>;

export type ButtonIconSize = ButtonDiscreteIconSize | Size;

export const ButtonTypes = enumeratedLiterals(["button", "icon-button", "link"] as const, {});
export type ButtonType = EnumeratedLiteralsMember<typeof ButtonTypes>;

export const ButtonForms = enumeratedLiterals(["button", "a", "link", "div"] as const, {});
export type ButtonForm = EnumeratedLiteralsMember<typeof ButtonForms>;

type IfButtonOrLink<V, T extends ButtonType, R = never> = T extends "button" | "link" ? V : R;

type ButtonFontSize<T extends ButtonType> = {
  button: ButtonSize<"button">;
  "icon-button": never;
  link: TypographyCharacteristics["fontSize"];
}[T];

export type AbstractProps<T extends ButtonType, F extends ButtonForm> = ComponentProps & {
  readonly buttonType: T;
  readonly as?: F;
  readonly variant?: ButtonVariant<T>;
  readonly fontFamily?: IfButtonOrLink<TypographyCharacteristics["fontFamily"], T, never>;
  readonly fontWeight?: IfButtonOrLink<TypographyCharacteristics["fontWeight"], T, never>;
  readonly transform?: IfButtonOrLink<TypographyCharacteristics["transform"], T, never>;
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
  readonly tourId?: string;
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

export type AbstractButtonProps = Pick<HTMLElementProps<"button">, CommonEventProps | "id"> & {
  readonly type?: "submit" | "button";
};

export type AbstractDivProps = Pick<HTMLElementProps<"div">, CommonEventProps | "id">;

export type AbstractLinkProps = Pick<
  NextLinkProps,
  "href" | (CommonEventProps & keyof NextLinkProps)
>;

export type AbstractAnchorProps = Pick<HTMLElementProps<"a">, CommonEventProps | "id"> & {
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
};

export type PolymorphicAbstractButtonProps<F extends ButtonForm> = {
  link: AbstractLinkProps;
  button: AbstractButtonProps;
  a: AbstractAnchorProps;
  div: AbstractDivProps;
}[F];

export type PolymorphicButtonElement<F extends ButtonForm> = {
  link: HTMLAnchorElement;
  a: HTMLAnchorElement;
  button: HTMLButtonElement;
  div: HTMLDivElement;
}[F];

export type PolymorphicButtonRef<F extends ButtonForm> = {
  link: ForwardedRef<HTMLAnchorElement>;
  a: ForwardedRef<HTMLAnchorElement>;
  button: ForwardedRef<HTMLButtonElement>;
  div: ForwardedRef<HTMLDivElement>;
}[F];

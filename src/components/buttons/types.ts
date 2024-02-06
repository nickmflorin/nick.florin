import { type LinkProps as NextLinkProps } from "next/link";
import { type ReactNode } from "react";

import { type EnumeratedLiteralsType, enumeratedLiterals } from "~/lib/literals";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import { type FontWeight } from "~/components/typography";

export const ButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "outline", "danger"] as const,
  {},
);
export type ButtonVariant = EnumeratedLiteralsType<typeof ButtonVariants>;

export const ButtonSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge"] as const,
  {},
);
export type ButtonSize = EnumeratedLiteralsType<typeof ButtonSizes>;

export const ButtonIconSizes = enumeratedLiterals(
  ["xsmall", "small", "medium", "large", "xlarge", "full"] as const,
  {},
);
export type ButtonIconSize = EnumeratedLiteralsType<typeof ButtonIconSizes>;

export const ButtonTypes = enumeratedLiterals(["button", "icon-button"] as const, {});
export type ButtonType = EnumeratedLiteralsType<typeof ButtonTypes>;

export const ButtonForms = enumeratedLiterals(["button", "a", "link"] as const, {});
export type ButtonForm = EnumeratedLiteralsType<typeof ButtonForms>;

export type ButtonOptions = {
  as?: ButtonForm;
};

type InferForm<O extends ButtonOptions> = O extends { as: infer F extends ButtonForm }
  ? F
  : "button";

type IfText<V, T extends ButtonType> = T extends "icon-button" ? never : V;

export type AbstractProps<T extends ButtonType, O extends ButtonOptions> = ComponentProps & {
  readonly buttonType: T;
  readonly variant?: ButtonVariant;
  /**
   * Sets the element in a "locked" state, which is a state in which the non-visual characteristics
   * of the "disabled" state should be used, but the element should not be styled as if it is
   * disabled.
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
  readonly options?: O;
  readonly fontWeight?: IfText<FontWeight, T>;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
  readonly iconSize?: ButtonIconSize;
} & PolymorphicAbstractButtonProps<InferForm<O>>;

export type AbstractButtonProps = Pick<
  HTMLElementProps<"button">,
  "onClick" | "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur"
> & {
  readonly type?: "submit" | "button";
};

export type AbstractLinkProps = {
  readonly href: NextLinkProps["href"];
  readonly onMouseEnter?: HTMLElementProps<"a">["onMouseEnter"];
};

export type AbstractAnchorProps = {
  readonly href: string;
  readonly onMouseEnter?: HTMLElementProps<"a">["onMouseEnter"];
};

export type PolymorphicAbstractButtonProps<F extends ButtonForm> = {
  link: AbstractLinkProps;
  button: AbstractButtonProps;
  a: AbstractAnchorProps;
}[F];

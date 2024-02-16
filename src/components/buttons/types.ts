import { type LinkProps as NextLinkProps } from "next/link";
import { type ReactNode, type ForwardedRef } from "react";

import { type EnumeratedLiteralsType, enumeratedLiterals } from "~/lib/literals";
import { type Size, type ComponentProps, type HTMLElementProps } from "~/components/types";
import { type BaseTypographyProps } from "~/components/typography";

export const ButtonButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "danger"] as const,
  {},
);
export type ButtonButtonVariant = EnumeratedLiteralsType<typeof ButtonButtonVariants>;

export const IconButtonVariants = enumeratedLiterals(
  ["primary", "secondary", "bare", "transparent", "danger"] as const,
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

export type ButtonOptions = {
  as?: ButtonForm;
};

type InferForm<O extends ButtonOptions> = O extends { as: infer F extends ButtonForm }
  ? F
  : "button";

type IfButton<V, T extends ButtonType, R = never> = T extends "button" ? V : R;
type IfLink<V, T extends ButtonType, R = never> = T extends "link" ? V : R;

type P = Pick<BaseTypographyProps, "fontFamily" | "fontWeight" | "transform">;

type ButtonTypographyProps<T extends ButtonType> = {
  [key in keyof P]?: IfButton<P[key], T, IfLink<P[key], T, never>>;
} & {
  readonly fontSize?: IfButton<
    ButtonSize<"button">,
    T,
    IfLink<BaseTypographyProps["size"], T, never>
  >;
};

export type AbstractProps<
  T extends ButtonType,
  O extends ButtonOptions,
> = ButtonTypographyProps<T> &
  ComponentProps & {
    readonly fontSize?: BaseTypographyProps["size"];
    readonly buttonType: T;
    readonly variant?: ButtonVariant<T>;
    /**
     * Sets the element in a "locked" state, which is a state in which the non-visual
     * characteristics of the "disabled" state should be used, but the element should not be styled
     * as if it is disabled.
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
    readonly size?: ButtonSize<T>;
    readonly disabledClassName?: ComponentProps["className"];
    readonly lockedClassName?: ComponentProps["className"];
    readonly loadingClassName?: ComponentProps["className"];
    readonly activeClassName?: ComponentProps["className"];
    readonly children: ReactNode;
    readonly iconSize?: ButtonIconSize;
  } & PolymorphicAbstractButtonProps<InferForm<O>>;

type CommonEventProps =
  | "onMouseEnter"
  | "onMouseLeave"
  | "onFocus"
  | "onBlur"
  | "onPointerDown"
  | "onPointerEnter"
  | "onMouseMove";

export type AbstractButtonProps = Pick<HTMLElementProps<"button">, "onClick" | CommonEventProps> & {
  readonly type?: "submit" | "button";
};

export type AbstractLinkProps = Pick<
  NextLinkProps,
  "href" | (CommonEventProps & keyof NextLinkProps)
>;

export type AbstractAnchorProps = Pick<HTMLElementProps<"a">, CommonEventProps> & {
  readonly href: string;
};

export type PolymorphicAbstractButtonProps<F extends ButtonForm> = {
  link: AbstractLinkProps;
  button: AbstractButtonProps;
  a: AbstractAnchorProps;
}[F];

export type PolymorphicButtonElement<O extends ButtonOptions> = {
  link: HTMLAnchorElement;
  a: HTMLAnchorElement;
  button: HTMLButtonElement;
}[InferForm<O>];

export type PolymorphicButtonRef<O extends ButtonOptions> = {
  link: ForwardedRef<HTMLAnchorElement>;
  a: ForwardedRef<HTMLAnchorElement>;
  button: ForwardedRef<HTMLButtonElement>;
}[InferForm<O>];

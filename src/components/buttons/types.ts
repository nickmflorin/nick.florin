import { type LinkProps as NextLinkProps } from "next/link";
import { type ReactNode } from "react";

import { type EnumeratedLiteralsType, enumeratedLiterals } from "~/lib/literals";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";

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

export const ButtonTypes = enumeratedLiterals(["button", "icon-button"] as const, {});
export type ButtonType = EnumeratedLiteralsType<typeof ButtonTypes>;

export const ButtonForms = enumeratedLiterals(["button", "a", "link"] as const, {});
export type ButtonForm = EnumeratedLiteralsType<typeof ButtonForms>;

export type ButtonOptions = { as: "link" } | { as: "a" } | { as?: "button" };

type GetButtonForm<O extends ButtonOptions> = O extends { readonly as: "link" }
  ? "link"
  : O extends { readonly as: "a" }
    ? "a"
    : "button";

type IfForm<
  T,
  F extends ButtonForm,
  O extends ButtonOptions,
  R = never,
> = F extends GetButtonForm<O> ? T : R;

export type AbstractButtonProps<O extends ButtonOptions> = ComponentProps & {
  readonly variant?: ButtonVariant;
  readonly buttonType: ButtonType;
  readonly children: ReactNode;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
  readonly isActive?: boolean;
  readonly options?: O;
  readonly size?: ButtonSize;
  readonly to?: IfForm<NextLinkProps["href"], "link", O>;
  readonly href?: IfForm<HTMLElementProps<"a">["href"], "a", O>;
  readonly onClick?: IfForm<HTMLElementProps<"button">["onClick"], "button", O>;
  readonly onMouseEnter?: IfForm<
    HTMLElementProps<"button">["onMouseEnter"],
    "button",
    O,
    IfForm<HTMLElementProps<"a">["onMouseEnter"], "link" | "a", O>
  >;
};

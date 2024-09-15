import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons/types";
import { type TypographyCharacteristics } from "~/components/types";
import { classNames, getTypographyClassName } from "~/components/types";

import { AbstractButton } from "./AbstractButton";

export type InlineLinkProps<E extends types.ButtonElement> = Omit<
  types.AbstractButtonProps<E>,
  "buttonType" | "isLoading"
> &
  Pick<TypographyCharacteristics, "fontSize" | "fontFamily" | "fontWeight" | "transform"> & {
    readonly children?: ReactNode;
  };

const LocalInlineLink = forwardRef(
  <E extends types.ButtonElement>(
    { fontSize, fontWeight, transform, fontFamily, children, ...props }: InlineLinkProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ) => {
    const ps = { ...props, buttonType: "inline-link", ref } as types.AbstractButtonProps<E> & {
      readonly ref?: types.PolymorphicButtonRef<E>;
    };
    return (
      <AbstractButton
        {...ps}
        className={classNames(
          getTypographyClassName({ fontSize, fontFamily, fontWeight, transform }),
          props.className,
        )}
      >
        {children}
      </AbstractButton>
    );
  },
) as {
  <E extends types.ButtonElement>(
    props: InlineLinkProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type ColorSchemePartial = {
  <E extends types.ButtonElement>(
    props: Omit<InlineLinkProps<E>, "scheme"> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type WithColorSchemes = { [key in Capitalize<types.ButtonColorScheme>]: ColorSchemePartial };

const withColorSchemes = types.ButtonColorSchemes.members.reduce<WithColorSchemes>(
  (acc, scheme) => ({
    ...acc,
    [capitalize(scheme)]: forwardRef(
      <E extends types.ButtonElement>(
        props: Omit<InlineLinkProps<E>, "scheme">,
        ref: types.PolymorphicButtonRef<E>,
      ) => <LocalInlineLink<E> {...({ ...props, scheme } as InlineLinkProps<E>)} ref={ref} />,
    ),
  }),
  {} as WithColorSchemes,
);

export const InlineLink = Object.assign(LocalInlineLink, withColorSchemes);

export type InlineLinkComponent = typeof LocalInlineLink & WithColorSchemes;

export default InlineLink;

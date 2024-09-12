import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons/types";

import { AbstractButton } from "./AbstractButton";

export type InlineLinkProps<E extends types.ButtonElement> = Omit<
  types.AbstractProps<"inline-link", E>,
  "buttonType"
> & {
  readonly children?: ReactNode;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const Base = AbstractButton as React.FC<types.AbstractProps<"inline-link", any>>;

const LocalInlineLink = forwardRef(
  <E extends types.ButtonElement>(
    { children, ...props }: InlineLinkProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ) => {
    const ps = { ...props, buttonType: "inline-link", ref } as types.AbstractProps<
      "inline-link",
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      any
    > & {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      readonly ref?: types.PolymorphicButtonRef<any>;
    };
    return <Base {...ps}>{children}</Base>;
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

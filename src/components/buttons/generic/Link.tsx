import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type LinkProps<E extends types.ButtonElement> = Omit<
  types.AbstractProps<"link", E>,
  "buttonType"
> & {
  readonly children?: ReactNode;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const Base = AbstractButton as React.FC<types.AbstractProps<"link", any>>;

const LocalLink = forwardRef(
  <E extends types.ButtonElement>(
    { children, icon, gap, iconClassName, loadingLocation, ...props }: LinkProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ) => {
    const ps = { ...props, buttonType: "link", ref } as types.AbstractProps<
      "link",
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      any
    > & {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      readonly ref?: types.PolymorphicButtonRef<any>;
    };
    return (
      <Base {...ps}>
        <ButtonContent
          gap={gap}
          iconSize={props.iconSize}
          iconClassName={iconClassName}
          isLoading={props.isLoading}
          icon={icon}
          loadingLocation={loadingLocation}
        >
          {children}
        </ButtonContent>
      </Base>
    );
  },
) as {
  <E extends types.ButtonElement>(
    props: LinkProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type ColorSchemePartial = {
  <E extends types.ButtonElement>(
    props: Omit<LinkProps<E>, "scheme"> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type WithColorSchemes = { [key in Capitalize<types.ButtonColorScheme>]: ColorSchemePartial };

const withColorSchemes = types.ButtonColorSchemes.members.reduce<WithColorSchemes>(
  (acc, scheme) => ({
    ...acc,
    [capitalize(scheme)]: forwardRef(
      <E extends types.ButtonElement>(
        props: Omit<LinkProps<E>, "scheme">,
        ref: types.PolymorphicButtonRef<E>,
      ) => <LocalLink<E> {...({ ...props, scheme } as LinkProps<E>)} ref={ref} />,
    ),
  }),
  {} as WithColorSchemes,
);

export const Link = Object.assign(LocalLink, withColorSchemes);

export type LinkComponent = typeof LocalLink & WithColorSchemes;

export default Link;

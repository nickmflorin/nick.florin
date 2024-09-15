import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons";
import {
  type TypographyCharacteristics,
  type ComponentProps,
  type Size,
  type QuantitativeSize,
  classNames,
  getTypographyClassName,
} from "~/components/types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type LinkProps<E extends types.ButtonElement> = Omit<
  types.AbstractButtonProps<E>,
  "buttonType"
> &
  Pick<TypographyCharacteristics, "fontSize" | "fontFamily" | "fontWeight" | "transform"> & {
    readonly children?: ReactNode;
    readonly icon?: types.ButtonIconProp;
    readonly iconClassName?: ComponentProps["className"];
    readonly iconSize?: types.ButtonIconSize;
    readonly spinnerSize?: QuantitativeSize<"px">;
    readonly spinnerClassName?: ComponentProps["className"];
    readonly gap?: Size;
    readonly loadingLocation?: types.ButtonLoadingLocation;
  };

const LocalLink = forwardRef(
  <E extends types.ButtonElement>(
    {
      children,
      icon,
      gap,
      iconClassName,
      spinnerClassName,
      loadingLocation,
      iconSize,
      spinnerSize,
      fontSize,
      fontFamily,
      fontWeight,
      transform,
      ...props
    }: LinkProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ) => {
    const ps = { ...props, buttonType: "link", ref } as types.AbstractButtonProps<E> & {
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
        <ButtonContent
          gap={gap}
          iconSize={iconSize}
          iconClassName={iconClassName}
          isLoading={props.isLoading}
          icon={icon}
          loadingLocation={loadingLocation}
          spinnerClassName={spinnerClassName}
          spinnerSize={spinnerSize}
        >
          {children}
        </ButtonContent>
      </AbstractButton>
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

import { forwardRef } from "react";

import clsx from "clsx";

import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp } from "~/components/icons";
import { type BaseTypographyProps, getTypographyClassName } from "~/components/typography";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

type LinkFlexProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  BaseTypographyProps & {
    readonly flex: true;
    readonly icon?: MultipleIconProp;
    readonly loadingLocation?: "left" | "over" | "right";
  };

type LinkBlockProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  BaseTypographyProps & {
    readonly flex?: false;
    readonly icon?: never;
    readonly loadingLocation?: never;
  };

export type LinkProps<O extends types.ButtonOptions> = LinkFlexProps<O> | LinkBlockProps<O>;

const Base = AbstractButton as React.FC<types.AbstractProps<"link", types.ButtonOptions>>;

const LocalLink = forwardRef(
  <O extends types.ButtonOptions>(
    {
      children,
      transform,
      icon,
      fontFamily,
      flex,
      size,
      fontWeight,
      /* Note: Since the 'Link' component does not have a 'height',  and it's 'height' is set based
         on the line-height of the text it contains, the 'iconSize' prop needs to be defaulted to
         a value that is not 100% of its parent container.  Otherwise, the icon and spinner will
         be very large. */
      iconSize = "small",
      loadingLocation = "left",
      ...props
    }: LinkProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      iconSize,
      buttonType: "link",
    } as types.AbstractProps<"link", O>;
    return (
      <Base
        {...ps}
        iconSize={iconSize}
        ref={ref}
        className={clsx(
          getTypographyClassName({
            size,
            fontFamily,
            fontWeight,
            transform,
          }),
          { "link--flex": flex },
        )}
      >
        {flex ? (
          <ButtonContent
            {...props}
            iconSize={iconSize}
            icon={icon}
            loadingLocation={loadingLocation}
          >
            {children}
          </ButtonContent>
        ) : (
          children
        )}
      </Base>
    );
  },
) as {
  <O extends types.ButtonOptions>(
    props: LinkProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type VariantPartial = {
  <O extends types.ButtonOptions>(
    props: Omit<LinkProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"link">>]: VariantPartial };

const withVariants = types.ButtonVariants.link.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef(
      <O extends types.ButtonOptions>(
        props: Omit<LinkProps<O>, "variant">,
        ref: types.PolymorphicButtonRef<O>,
      ) => <Link<O> {...({ ...props, variant } as LinkProps<O>)} ref={ref} />,
    ),
  }),
  {} as WithVariants,
);

export const Link = Object.assign(LocalLink, withVariants);

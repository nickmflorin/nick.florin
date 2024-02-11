import { forwardRef } from "react";

import { capitalize } from "~/lib/formatters";
import { type BaseTypographyProps, getTypographyClassName } from "~/components/typography";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type LinkProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  BaseTypographyProps;

const Base = AbstractButton as React.FC<types.AbstractProps<"link", types.ButtonOptions>>;

const LocalLink = forwardRef(
  <O extends types.ButtonOptions>(
    { children, transform, fontFamily, size, fontWeight, ...props }: LinkProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      buttonType: "link",
    } as types.AbstractProps<"link", O>;
    return (
      <Base
        {...ps}
        ref={ref}
        className={getTypographyClassName({
          size,
          fontFamily,
          fontWeight,
          transform,
        })}
      >
        {children}
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
    [capitalize(variant)]: <O extends types.ButtonOptions>(
      props: Omit<LinkProps<O>, "variant">,
    ) => <Link<O> {...({ ...props, variant } as LinkProps<O>)} />,
  }),
  {} as WithVariants,
);

export const Link = Object.assign(LocalLink, withVariants);

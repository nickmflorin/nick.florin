import { forwardRef } from "react";

import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp, parseMultipleIconsProp } from "~/components/icons";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type ButtonProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"button", O>,
  "buttonType"
> & {
  readonly icon?: MultipleIconProp;
};

const Base = AbstractButton as React.FC<types.AbstractProps<"button", types.ButtonOptions>>;

const LocalButton = forwardRef(
  <O extends types.ButtonOptions>(
    { children, icon, ...props }: ButtonProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const icons = icon ? parseMultipleIconsProp(icon) : [null, null];

    const ps = {
      ...props,
      buttonType: "button",
    } as types.AbstractProps<"button", O>;

    return (
      <Base {...ps} ref={ref}>
        <div className="button__sub-content">{children}</div>
      </Base>
    );
  },
) as {
  <O extends types.ButtonOptions>(
    props: ButtonProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type VariantPartial = {
  <O extends types.ButtonOptions>(
    props: Omit<ButtonProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"button">>]: VariantPartial };

const withVariants = types.ButtonVariants.button.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef(
      <O extends types.ButtonOptions>(
        props: Omit<ButtonProps<O>, "variant">,
        ref: types.PolymorphicButtonRef<O>,
      ) => <Button<O> {...({ ...props, variant } as ButtonProps<O>)} ref={ref} />,
    ) as {
      <O extends types.ButtonOptions>(
        props: Omit<ButtonProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
      ): JSX.Element;
    },
  }),
  {} as WithVariants,
);

export const Button = Object.assign(LocalButton, withVariants);

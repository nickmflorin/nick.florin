import { forwardRef } from "react";

import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp } from "~/components/icons";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type ButtonProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"button", O>,
  "buttonType"
> & {
  readonly icon?: MultipleIconProp;
  readonly loadingLocation?: "left" | "over" | "right";
};

const Base = AbstractButton as React.FC<types.AbstractProps<"button", types.ButtonOptions>>;

type LocalButtonType = {
  <O extends types.ButtonOptions>(
    props: ButtonProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

const LocalButton = forwardRef(
  <O extends types.ButtonOptions>(
    { children, icon, loadingLocation = "left", ...props }: ButtonProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      buttonType: "button",
    } as types.AbstractProps<"button", O>;

    return (
      <Base {...ps} ref={ref}>
        <ButtonContent {...props} icon={icon} loadingLocation={loadingLocation}>
          {children}
        </ButtonContent>
      </Base>
    );
  },
) as LocalButtonType;

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

export const Button = Object.assign(LocalButton, withVariants) as LocalButtonType & WithVariants;

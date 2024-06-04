import { forwardRef } from "react";

import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp } from "~/components/icons";
import { type ComponentProps } from "~/components/types";
import { type Size } from "~/components/types/sizes";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type ButtonProps<F extends types.ButtonForm> = Omit<
  types.AbstractProps<"button", F>,
  "buttonType"
> & {
  readonly icon?: MultipleIconProp;
  readonly gap?: Size;
  readonly loadingLocation?: "left" | "over" | "right";
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
};

type LocalButtonType = {
  <F extends types.ButtonForm>(
    props: ButtonProps<F> & { readonly ref?: types.PolymorphicButtonRef<F> },
  ): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const Base = AbstractButton as React.FC<types.AbstractProps<"button", any>>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const LocalButton = forwardRef<types.PolymorphicButtonElement<any>, ButtonProps<any>>(
  <F extends types.ButtonForm>(
    { icon, loadingLocation, gap, iconClassName, ...props }: ButtonProps<F>,
    ref: types.PolymorphicButtonRef<F>,
  ): JSX.Element => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const ps = { ...props, buttonType: "button", ref } as types.AbstractProps<"button", any> & {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      readonly ref?: types.PolymorphicButtonRef<any>;
    };
    return (
      <Base {...ps}>
        <ButtonContent
          isLoading={props.isLoading}
          iconSize={props.iconSize}
          iconClassName={iconClassName}
          gap={gap}
          icon={icon}
          loadingLocation={loadingLocation}
        >
          {props.children}
        </ButtonContent>
      </Base>
    );
  },
) as LocalButtonType;

type VariantPartial = {
  <F extends types.ButtonForm>(
    props: Omit<ButtonProps<F>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<F> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"button">>]: VariantPartial };

const withVariants = types.ButtonVariants.button.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef<
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      types.PolymorphicButtonElement<any>,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      Omit<ButtonProps<any>, "variant">
    >(
      <F extends types.ButtonForm>(
        props: Omit<ButtonProps<F>, "variant">,
        ref: types.PolymorphicButtonRef<F>,
      ) => <Button<F> {...({ ...props, variant } as ButtonProps<F>)} ref={ref} />,
    ) as VariantPartial,
  }),
  {} as WithVariants,
);

export const Button = Object.assign(LocalButton, withVariants) as LocalButtonType & WithVariants;

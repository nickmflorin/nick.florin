import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type ButtonProps<E extends types.ButtonElement> = Omit<
  types.AbstractProps<"button", E>,
  "buttonType"
> & {
  readonly children?: ReactNode;
};

type LocalButtonType = {
  <E extends types.ButtonElement>(
    props: ButtonProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const Base = AbstractButton as React.FC<types.AbstractProps<"button", any>>;

const LocalButton = forwardRef(
  <E extends types.ButtonElement>(
    { icon, loadingLocation, gap, iconClassName, spinnerSize, children, ...props }: ButtonProps<E>,
    ref: types.PolymorphicButtonRef<E>,
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
          spinnerSize={spinnerSize}
          gap={gap}
          icon={icon}
          loadingLocation={loadingLocation}
        >
          {children}
        </ButtonContent>
      </Base>
    );
  },
) as LocalButtonType;

type VariantPartial = {
  <E extends types.ButtonElement>(
    props: Omit<ButtonProps<E>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"button">>]: VariantPartial };

const withVariants = types.ButtonVariants.button.members.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef(
      <E extends types.ButtonElement>(
        props: Omit<ButtonProps<E>, "variant">,
        ref: types.PolymorphicButtonRef<E>,
      ) => <LocalButton<E> {...({ ...props, variant } as ButtonProps<E>)} ref={ref} />,
    ) as VariantPartial,
  }),
  {} as WithVariants,
);

export const Button = Object.assign(LocalButton, withVariants) as LocalButtonType & WithVariants;

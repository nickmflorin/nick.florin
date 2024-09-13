import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons";
import {
  buttonSizeClassName,
  buttonIconSizeClassName,
  getButtonSizeStyle,
} from "~/components/buttons/util";
import {
  type TypographyCharacteristics,
  classNames,
  type ComponentProps,
  type Size,
  type QuantitativeSize,
  getTypographyClassName,
} from "~/components/types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type ButtonProps<E extends types.ButtonElement> = Omit<
  types.AbstractProps<E>,
  "buttonType"
> &
  Pick<TypographyCharacteristics, "fontSize" | "fontFamily" | "fontWeight" | "transform"> & {
    readonly children?: ReactNode;
    readonly variant?: types.ButtonButtonVariant;
    readonly fontSize?: TypographyCharacteristics["fontSize"];
    readonly icon?: types.ButtonIconProp;
    readonly iconClassName?: ComponentProps["className"];
    readonly iconSize?: types.ButtonIconSize;
    readonly spinnerSize?: QuantitativeSize<"px">;
    readonly spinnerClassName?: ComponentProps["className"];
    readonly gap?: Size;
    readonly size?: types.ButtonSize;
    readonly loadingLocation?: types.ButtonLoadingLocation;
  };

type LocalButtonType = {
  <E extends types.ButtonElement>(
    props: ButtonProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

// /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
// const Base = AbstractButton as React.FC<types.AbstractProps<types.ButtonElement>>;

const LocalButton = forwardRef(
  <E extends types.ButtonElement>(
    {
      fontSize,
      icon,
      loadingLocation,
      gap,
      iconClassName,
      spinnerSize,
      spinnerClassName,
      children,
      iconSize,
      fontFamily,
      fontWeight,
      transform,
      variant,
      size,
      ...props
    }: ButtonProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ): JSX.Element => {
    const ps = { ...props, buttonType: "button", ref } as types.AbstractProps<E> & {
      readonly ref?: types.PolymorphicButtonRef<E>;
    };
    return (
      <AbstractButton
        {...ps}
        className={classNames(
          `button--variant-${variant ?? "solid"}`,
          buttonSizeClassName(size),
          buttonIconSizeClassName(iconSize),
          getTypographyClassName({ fontSize, fontFamily, fontWeight, transform }),
          props.className,
        )}
        style={getButtonSizeStyle({ size, style: props.style })}
      >
        <ButtonContent
          isLoading={props.isLoading}
          iconSize={iconSize}
          iconClassName={iconClassName}
          spinnerSize={spinnerSize}
          gap={gap}
          icon={icon}
          loadingLocation={loadingLocation}
          spinnerClassName={spinnerClassName}
        >
          {children}
        </ButtonContent>
      </AbstractButton>
    );
  },
) as LocalButtonType;

type VariantPartial = {
  <E extends types.ButtonElement>(
    props: Omit<ButtonProps<E>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonButtonVariant>]: VariantPartial };

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

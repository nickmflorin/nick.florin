import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons";
import { getButtonSizeStyle } from "~/components/buttons/util";
import {
  type TypographyCharacteristics,
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  getTypographyClassName,
  parseDataAttributes,
} from "~/components/types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

export type ButtonProps<E extends types.ButtonElement> = Omit<
  types.AbstractButtonProps<E>,
  "buttonType"
> &
  Pick<
    TypographyCharacteristics,
    "fontSize" | "fontFamily" | "fontWeight" | "transform" | "truncate"
  > & {
    readonly children?: ReactNode;
    readonly variant?: types.ButtonButtonVariant;
    readonly fontSize?: TypographyCharacteristics["fontSize"];
    readonly icon?: types.ButtonIconProp;
    readonly iconClassName?: ComponentProps["className"];
    readonly iconSize?: types.ButtonIconSize;
    readonly spinnerSize?: QuantitativeSize<"px">;
    readonly spinnerClassName?: ComponentProps["className"];
    readonly gap?: QuantitativeSize<"px">;
    readonly size?: types.ButtonSize;
    readonly loadingLocation?: types.ButtonLoadingLocation;
  };

type LocalButtonType = {
  <E extends types.ButtonElement>(
    props: ButtonProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

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
      truncate = true,
      ...props
    }: ButtonProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ): JSX.Element => {
    const ps = { ...props, buttonType: "button", ref } as types.AbstractButtonProps<E> & {
      readonly ref?: types.PolymorphicButtonRef<E>;
    };
    return (
      <AbstractButton
        {...ps}
        {...parseDataAttributes({
          variant: variant ?? "solid",
          /* Only include the size data attribute if the size conforms to a standardized, discrete
             size option (e.g. "sm", "md", "lg", etc.).  If it does not, it is a numeric size, and
             should be incorporated into the element via inline styles. */
          size: types.ButtonDiscreteSizes.contains(size) ? size : undefined,
          /* Only include the icon size data attribute if the icon size conforms to a standardized,
             discrete size option (e.g. "sm", "md", "lg", etc.).  If it does not, it is a numeric
             size, and should be incorporated into the element via inline styles. */
          iconSize:
            iconSize && types.ButtonDiscreteIconSizes.contains(iconSize) ? iconSize : undefined,
        })}
        className={classNames(
          getTypographyClassName({ fontSize, fontFamily, fontWeight, transform, truncate }),
          props.className,
        )}
        style={{ ...props.style, ...getButtonSizeStyle({ size }) }}
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

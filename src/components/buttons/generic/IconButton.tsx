import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";

import * as types from "~/components/buttons";
import {
  buttonSizeClassName,
  buttonIconSizeClassName,
  toIconSize,
  getButtonSizeStyle,
} from "~/components/buttons/util";
import { type IconName, type IconProp, isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import Spinner from "~/components/icons/Spinner";
import {
  classNames,
  type ClassName,
  sizeToString,
  type QuantitativeSize,
  type ComponentProps,
} from "~/components/types";

import { AbstractButton } from "./AbstractButton";

export type IconButtonProps<E extends types.ButtonElement> = Omit<
  types.AbstractButtonProps<E>,
  "buttonType"
> & {
  readonly tight?: boolean;
  readonly children?: ReactNode;
  readonly icon?: IconName | IconProp | JSX.Element;
  readonly spinnerClassName?: ComponentProps["className"];
  readonly iconClassName?: ComponentProps["className"];
  readonly iconSize?: types.ButtonIconSize;
  readonly spinnerSize?: QuantitativeSize<"px">;
  readonly size?: types.ButtonSize;
  readonly variant?: types.IconButtonVariant;
};

interface WithLoadingProps {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly iconSize?: types.ButtonIconSize;
  readonly spinnerSize?: QuantitativeSize<"px">;
  readonly spinnerClassName?: ClassName;
  readonly iconClassName?: ClassName;
}

const WithLoading = ({
  children,
  isLoading,
  spinnerSize,
  iconSize,
  iconClassName,
  spinnerClassName,
}: WithLoadingProps): JSX.Element => {
  if (isLoading) {
    return (
      <Spinner
        className={classNames(iconClassName, spinnerClassName)}
        isLoading
        size={spinnerSize ?? toIconSize(iconSize)}
      />
    );
  }
  return <>{children}</>;
};

const LocalIconButton = forwardRef(
  <E extends types.ButtonElement>(
    {
      children,
      icon,
      iconClassName,
      spinnerSize,
      spinnerClassName,
      iconSize,
      tight = false,
      size,
      variant,
      ...props
    }: IconButtonProps<E>,
    ref: types.PolymorphicButtonRef<E>,
  ) => {
    const ps = { ...props, buttonType: "icon-button", ref } as types.AbstractButtonProps<E> & {
      readonly ref?: types.PolymorphicButtonRef<E>;
    };
    return (
      <AbstractButton
        {...ps}
        className={classNames(
          `button--variant-${variant ?? "transparent"}`,
          buttonSizeClassName(size),
          buttonIconSizeClassName(iconSize),
          { "button--tight": tight },
          ps.className,
        )}
        style={getButtonSizeStyle({ size, style: props.style })}
      >
        <div className="button__content">
          {children ? (
            <WithLoading
              isLoading={props.isLoading}
              iconSize={iconSize}
              spinnerSize={spinnerSize}
              iconClassName={iconClassName}
              spinnerClassName={spinnerClassName}
            >
              {children}
            </WithLoading>
          ) : isIconProp(icon) || typeof icon === "string" ? (
            <Icon
              className={iconClassName}
              loadingClassName={spinnerClassName}
              icon={icon}
              isLoading={props.isLoading}
              fit="square"
              dimension="height"
              spinnerSize={spinnerSize}
              size={
                iconSize !== undefined && !types.ButtonDiscreteIconSizes.contains(iconSize)
                  ? sizeToString(iconSize, "px")
                  : undefined
              }
            />
          ) : (
            <WithLoading
              isLoading={props.isLoading}
              iconSize={iconSize}
              iconClassName={iconClassName}
              spinnerSize={spinnerSize}
              spinnerClassName={spinnerClassName}
            >
              {icon}
            </WithLoading>
          )}
        </div>
      </AbstractButton>
    );
  },
) as {
  <E extends types.ButtonElement>(
    props: IconButtonProps<E> & { readonly ref?: types.PolymorphicButtonRef<E> },
  ): JSX.Element;
};

type VariantPartial = {
  <E extends types.ButtonElement>(
    props: Omit<IconButtonProps<E>, "variant"> & {
      readonly ref?: types.PolymorphicButtonRef<E>;
    },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.IconButtonVariant>]: VariantPartial };

const withVariants = types.ButtonVariants["icon-button"].members.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef(
      <E extends types.ButtonElement>(
        props: Omit<IconButtonProps<E>, "variant">,
        ref: types.PolymorphicButtonRef<E>,
      ) => <LocalIconButton<E> {...({ ...props, variant } as IconButtonProps<E>)} ref={ref} />,
    ),
  }),
  {} as WithVariants,
);

export const IconButton = Object.assign(LocalIconButton, withVariants);

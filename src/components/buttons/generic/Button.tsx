import { type JSX, type ReactNode } from 'react';

import { capitalize } from '~/lib/formatters';

import * as types from '~/components/buttons';
import {
  getButtonSizeStyle,
  getResponsiveButtonSizeAttributes,
  toDiscreteIconSize,
  toDiscreteSize,
} from '~/components/buttons/util';
import {
  classNames,
  type ComponentProps,
  getTypographyClassName,
  parseDataAttributes,
  type QuantitativeSize,
  type TypographyCharacteristics,
} from '~/components/types';

import { AbstractButton } from './AbstractButton';
import { ButtonContent } from './ButtonContent';

export type ButtonProps<E extends types.ButtonElement> = {
  readonly children?: ReactNode;
  readonly fontSize?: TypographyCharacteristics['fontSize'];
  readonly gap?: QuantitativeSize<'px'>;
  readonly icon?: types.ButtonIconProp;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: types.ButtonIconSize;
  readonly loadingLocation?: types.ButtonLoadingLocation;
  readonly size?: types.ButtonSize;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: QuantitativeSize<'px'>;
  readonly variant?: types.ButtonButtonVariant;
} & Omit<types.AbstractButtonProps<E>, 'buttonType'> &
  Pick<
    TypographyCharacteristics,
    'fontFamily' | 'fontSize' | 'fontWeight' | 'transform' | 'truncate'
  >;

type LocalButtonType = <E extends types.ButtonElement>(
  props: { readonly ref?: types.PolymorphicButtonRef<E> } & ButtonProps<E>,
) => JSX.Element;

const LocalButton: LocalButtonType = <E extends types.ButtonElement>({
  children,
  fontFamily,
  fontSize,
  fontWeight,
  gap,
  icon,
  iconClassName,
  iconSize,
  loadingLocation,
  ref,
  size,
  spinnerClassName,
  spinnerSize,
  transform,
  truncate = true,
  variant,
  ...props
}: { readonly ref?: types.PolymorphicButtonRef<E> } & ButtonProps<E>): JSX.Element => {
  const ps = { ...props, buttonType: 'button', ref } as {
    readonly ref?: types.PolymorphicButtonRef<E>;
  } & types.AbstractButtonProps<E>;
  return (
    <AbstractButton
      {...ps}
      {...parseDataAttributes({
        ...getResponsiveButtonSizeAttributes(size),
        iconSize: toDiscreteIconSize(iconSize),
        size: toDiscreteSize(size),
        variant: variant ?? 'solid',
      })}
      className={classNames(
        getTypographyClassName({ fontFamily, fontSize, fontWeight, transform, truncate }),
        props.className,
      )}
      style={{ ...props.style, ...getButtonSizeStyle({ size }) }}
    >
      <ButtonContent
        gap={gap}
        icon={icon}
        iconClassName={iconClassName}
        iconSize={iconSize}
        isLoading={props.isLoading}
        loadingLocation={loadingLocation}
        spinnerClassName={spinnerClassName}
        spinnerSize={spinnerSize}
      >
        {children}
      </ButtonContent>
    </AbstractButton>
  );
};

type VariantPartial = <E extends types.ButtonElement>(
  props: { readonly ref?: types.PolymorphicButtonRef<E> } & Omit<ButtonProps<E>, 'variant'>,
) => JSX.Element;

type WithVariants = Record<Capitalize<types.ButtonButtonVariant>, VariantPartial>;

const withVariants = types.ButtonVariants.button.members.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: (<E extends types.ButtonElement>(
      props: { readonly ref?: types.PolymorphicButtonRef<E> } & Omit<ButtonProps<E>, 'variant'>,
    ) => <LocalButton<E> {...{ ...props, variant }} />) as VariantPartial,
  }),
  {} as WithVariants,
);

export const Button = Object.assign(LocalButton, withVariants);

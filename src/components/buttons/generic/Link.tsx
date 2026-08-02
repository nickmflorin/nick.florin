import { type JSX, type ReactNode } from 'react';

import { capitalize } from '~/lib/formatters';

import * as types from '~/components/buttons';
import {
  classNames,
  type ComponentProps,
  getTypographyClassName,
  getTypographyStyle,
  omitTypographyProps,
  type QuantitativeSize,
  type TypographyCharacteristics,
} from '~/components/types';

import { AbstractButton } from './AbstractButton';
import { ButtonContent } from './ButtonContent';

export type LinkProps<E extends types.ButtonElement> = {
  readonly children?: ReactNode;
  readonly gap?: QuantitativeSize<'px'>;
  readonly icon?: types.ButtonIconProp;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: types.ButtonIconSize;
  readonly loadingLocation?: types.ButtonLoadingLocation;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: QuantitativeSize<'px'>;
} & Omit<types.AbstractButtonProps<E>, 'buttonType'> &
  Pick<
    TypographyCharacteristics,
    'fontFamily' | 'fontSize' | 'fontWeight' | 'transform' | 'truncate'
  >;

const LocalLink = <E extends types.ButtonElement>({
  children,
  gap,
  icon,
  iconClassName,
  iconSize,
  loadingLocation,
  ref,
  spinnerClassName,
  spinnerSize,
  ...props
}: { readonly ref?: types.PolymorphicButtonRef<E> } & LinkProps<E>): JSX.Element => {
  const ps = {
    ...omitTypographyProps(props),
    buttonType: 'link',
    ref,
  } as {
    readonly ref?: types.PolymorphicButtonRef<E>;
  } & types.AbstractButtonProps<E>;
  return (
    <AbstractButton
      {...ps}
      className={classNames(getTypographyClassName(props), props.className)}
      style={{ ...getTypographyStyle(props), ...props.style }}
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

type ColorSchemePartial = <E extends types.ButtonElement>(
  props: { readonly ref?: types.PolymorphicButtonRef<E> } & Omit<LinkProps<E>, 'scheme'>,
) => JSX.Element;

type WithColorSchemes = Record<Capitalize<types.ButtonColorScheme>, ColorSchemePartial>;

const withColorSchemes = types.ButtonColorSchemes.members.reduce<WithColorSchemes>(
  (acc, scheme) => ({
    ...acc,
    [capitalize(scheme)]: <E extends types.ButtonElement>({
      ref,
      ...props
    }: { readonly ref?: types.PolymorphicButtonRef<E> } & Omit<LinkProps<E>, 'scheme'>) => (
      <LocalLink<E> {...{ ...props, scheme }} ref={ref} />
    ),
  }),
  {} as WithColorSchemes,
);

export const Link = Object.assign(LocalLink, withColorSchemes);

export type LinkComponent = typeof LocalLink & WithColorSchemes;

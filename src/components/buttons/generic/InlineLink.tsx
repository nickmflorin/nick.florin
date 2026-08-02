import { type JSX, type ReactNode } from 'react';

import { capitalize } from '~/lib/formatters';

import * as types from '~/components/buttons/types';
import {
  classNames,
  getTypographyClassName,
  type TypographyCharacteristics,
} from '~/components/types';

import { AbstractButton } from './AbstractButton';

export type InlineLinkProps<E extends types.ButtonElement> = {
  readonly children?: ReactNode;
} & Omit<types.AbstractButtonProps<E>, 'buttonType' | 'isLoading'> &
  Pick<TypographyCharacteristics, 'fontFamily' | 'fontSize' | 'fontWeight' | 'transform'>;

const LocalInlineLink = <E extends types.ButtonElement>({
  children,
  fontFamily,
  fontSize,
  fontWeight,
  ref,
  transform,
  ...props
}: { readonly ref?: types.PolymorphicButtonRef<E> } & InlineLinkProps<E>): JSX.Element => {
  const ps = { ...props, buttonType: 'inline-link', ref } as {
    readonly ref?: types.PolymorphicButtonRef<E>;
  } & types.AbstractButtonProps<E>;
  return (
    <AbstractButton
      {...ps}
      className={classNames(
        getTypographyClassName({ fontFamily, fontSize, fontWeight, transform }),
        props.className,
      )}
    >
      {children}
    </AbstractButton>
  );
};

type ColorSchemePartial = <E extends types.ButtonElement>(
  props: { readonly ref?: types.PolymorphicButtonRef<E> } & Omit<InlineLinkProps<E>, 'scheme'>,
) => JSX.Element;

type WithColorSchemes = Record<Capitalize<types.ButtonColorScheme>, ColorSchemePartial>;

const withColorSchemes = types.ButtonColorSchemes.members.reduce<WithColorSchemes>(
  (acc, scheme) => ({
    ...acc,
    [capitalize(scheme)]: <E extends types.ButtonElement>({
      ref,
      ...props
    }: { readonly ref?: types.PolymorphicButtonRef<E> } & Omit<InlineLinkProps<E>, 'scheme'>) => (
      <LocalInlineLink<E> {...{ ...props, scheme }} ref={ref} />
    ),
  }),
  {} as WithColorSchemes,
);

export const InlineLink = Object.assign(LocalInlineLink, withColorSchemes);

export type InlineLinkComponent = typeof LocalInlineLink & WithColorSchemes;

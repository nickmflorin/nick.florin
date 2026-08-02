import { type JSX } from 'react';

import { type Subtract } from 'utility-types';

import {
  classNames,
  type TypographyComponent,
  type TypographyRef,
  type TypographyVariant,
} from '~/components/types';

import { BaseTypography, type BaseTypographyProps } from './BaseTypography';

type Inherit<T extends TypographyVariant> = T extends 'text' ? boolean : never;

type TypographyPropsPartial<T extends TypographyVariant> = {
  readonly inherit?: Inherit<T>;
  readonly isDisabled?: boolean;
  readonly variant: T;
};

export type TypographyProps<
  T extends TypographyVariant,
  C extends TypographyComponent<T>,
> = BaseTypographyProps<C> & TypographyPropsPartial<T>;

const TypographyClassNames: Record<TypographyVariant, string> = {
  label: 'label',
  text: 'body',
  title: 'title',
};

export const Typography = (<T extends TypographyVariant, C extends TypographyComponent<T>>({
  inherit,
  isDisabled,
  ref,
  variant,
  ...props
}: { readonly ref?: TypographyRef<C> } & TypographyProps<T, C>): JSX.Element | null => {
  if (!props.children || (typeof props.children === 'string' && props.children.trim() === '')) {
    return null;
  }
  return (
    <BaseTypography
      {...(props as Subtract<
        TypographyProps<T, C>,
        TypographyPropsPartial<T>
      > as BaseTypographyProps<C>)}
      className={classNames(
        TypographyClassNames[variant],
        {
          [`${TypographyClassNames[variant]}--inherit`]: inherit,
          'text-disabled': isDisabled,
        },
        props.className,
      )}
      ref={ref}
    />
  );
}) as <T extends TypographyVariant, C extends TypographyComponent<T>>(
  props: { readonly ref?: TypographyRef<C> } & TypographyProps<T, C>,
) => JSX.Element;

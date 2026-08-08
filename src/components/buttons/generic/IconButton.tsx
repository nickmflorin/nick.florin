import { type JSX, type ReactNode } from 'react';

import { capitalize } from '~/lib/formatters';

import * as types from '~/components/buttons';
import {
  getButtonSizeStyle,
  getResponsiveButtonSizeAttributes,
  toDiscreteIconSize,
  toDiscreteSize,
  toIconSize,
} from '~/components/buttons/util';
import { type IconName, type IconProp, isIconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { Spinner } from '~/components/icons/Spinner';
import {
  type ClassName,
  classNames,
  type ComponentProps,
  parseDataAttributes,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

import { AbstractButton } from './AbstractButton';

export type IconButtonProps<E extends types.ButtonElement> = {
  readonly children?: ReactNode;
  readonly icon?: IconName | IconProp | JSX.Element;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: types.ButtonIconSize;
  readonly isTight?: boolean;
  readonly size?: types.ButtonSize;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: QuantitativeSize<'px'>;
  readonly variant?: types.IconButtonVariant;
} & Omit<types.AbstractButtonProps<E>, 'buttonType'>;

interface WithLoadingProps {
  readonly children: ReactNode;
  readonly iconClassName?: ClassName;
  readonly iconSize?: types.ButtonIconSize;
  readonly isLoading?: boolean;
  readonly spinnerClassName?: ClassName;
  readonly spinnerSize?: QuantitativeSize<'px'>;
}

const WithLoading = ({
  children,
  iconClassName,
  iconSize,
  isLoading,
  spinnerClassName,
  spinnerSize,
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

const LocalIconButton = <E extends types.ButtonElement>({
  children,
  icon,
  iconClassName,
  iconSize,
  isTight = false,
  ref,
  size,
  spinnerClassName,
  spinnerSize,
  variant,
  ...props
}: { readonly ref?: types.PolymorphicButtonRef<E> } & IconButtonProps<E>): JSX.Element => {
  const ps = { ...props, buttonType: 'icon-button', ref } as {
    readonly ref?: types.PolymorphicButtonRef<E>;
  } & types.AbstractButtonProps<E>;
  return (
    <AbstractButton
      {...ps}
      {...parseDataAttributes({
        ...getResponsiveButtonSizeAttributes(size),
        iconSize: toDiscreteIconSize(iconSize),
        size: toDiscreteSize(size),
        tight: isTight,
        variant: variant ?? 'transparent',
      })}
      style={{ ...props.style, ...getButtonSizeStyle({ size }) }}
    >
      <span className='button__content'>
        {children ? (
          <WithLoading
            iconClassName={iconClassName}
            iconSize={iconSize}
            isLoading={props.isLoading}
            spinnerClassName={spinnerClassName}
            spinnerSize={spinnerSize}
          >
            {children}
          </WithLoading>
        ) : isIconProp(icon) || typeof icon === 'string' ? (
          <Icon
            className={iconClassName}
            dimension='height'
            fit='square'
            icon={icon}
            isLoading={props.isLoading}
            size={
              iconSize !== undefined && !types.ButtonDiscreteIconSizes.contains(iconSize)
                ? sizeToString(iconSize, 'px')
                : undefined
            }
            spinnerClassName={spinnerClassName}
            spinnerSize={spinnerSize}
          />
        ) : (
          <WithLoading
            iconClassName={iconClassName}
            iconSize={iconSize}
            isLoading={props.isLoading}
            spinnerClassName={spinnerClassName}
            spinnerSize={spinnerSize}
          >
            {icon}
          </WithLoading>
        )}
      </span>
    </AbstractButton>
  );
};

type VariantPartial = <E extends types.ButtonElement>(
  props: {
    readonly ref?: types.PolymorphicButtonRef<E>;
  } & Omit<IconButtonProps<E>, 'variant'>,
) => JSX.Element;

type WithVariants = Record<Capitalize<types.IconButtonVariant>, VariantPartial>;

const withVariants = types.ButtonVariants['icon-button'].members.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: <E extends types.ButtonElement>({
      ref,
      ...props
    }: {
      readonly ref?: types.PolymorphicButtonRef<E>;
    } & Omit<IconButtonProps<E>, 'variant'>) => (
      <LocalIconButton<E> {...{ ...props, variant }} ref={ref} />
    ),
  }),
  {} as WithVariants,
);

export const IconButton = Object.assign(LocalIconButton, withVariants);

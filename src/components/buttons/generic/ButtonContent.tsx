import { type JSX, type ReactNode } from 'react';

import { type Required } from 'utility-types';

import * as types from '~/components/buttons';
import { toIconSize } from '~/components/buttons/util';
import { type IconName, type IconProp, isIconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { Spinner } from '~/components/icons/Spinner';
import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

export interface ButtonContentProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly gap?: QuantitativeSize<'px'>;
  readonly icon?: types.ButtonIconProp;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: types.ButtonIconSize;
  readonly isLoading?: boolean;
  readonly loadingLocation?: types.ButtonLoadingLocation;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: QuantitativeSize<'px'>;
}

interface RenderOrSpinnerProps extends Required<
  Pick<
    ButtonContentProps,
    | 'children'
    | 'iconClassName'
    | 'iconSize'
    | 'isLoading'
    | 'loadingLocation'
    | 'spinnerClassName'
    | 'spinnerSize'
  >,
  'loadingLocation'
> {
  readonly location: Exclude<types.ButtonLoadingLocation, 'over'>;
}

const RenderOrSpinner = ({
  children,
  iconClassName,
  iconSize,
  isLoading,
  loadingLocation,
  location,
  spinnerClassName,
  spinnerSize,
}: RenderOrSpinnerProps): JSX.Element => {
  if (isLoading && location === loadingLocation) {
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

interface ContentIconProps extends Pick<
  ButtonContentProps,
  | 'iconClassName'
  | 'iconSize'
  | 'isLoading'
  | 'loadingLocation'
  | 'spinnerClassName'
  | 'spinnerSize'
> {
  readonly icon: IconName | IconProp;
  readonly location: Exclude<types.ButtonLoadingLocation, 'over'>;
}

const ContentIcon = ({
  icon,
  iconClassName,
  iconSize,
  isLoading,
  loadingLocation,
  location,
  spinnerClassName,
}: ContentIconProps) => (
  <Icon
    className={iconClassName}
    dimension='height'
    fit='square'
    icon={icon}
    isLoading={isLoading ? loadingLocation === location : false}
    size={toIconSize(iconSize)}
    spinnerClassName={classNames(iconClassName, spinnerClassName)}
  />
);

const parseIconsAndLoadingLocation = ({
  icon,
  loadingLocation,
}: Pick<ButtonContentProps, 'icon' | 'loadingLocation'>) => {
  const [leftIcon, rightIcon] = icon ? types.parseButtonIcons(icon) : ([null, null] as const);
  const defaultLoadingLocation = leftIcon ? 'left' : rightIcon ? 'right' : 'left';
  return {
    leftIcon,
    loadingLocation: loadingLocation ?? defaultLoadingLocation,
    rightIcon,
  };
};

export const ButtonContent = ({
  children,
  gap,
  icon,
  iconClassName,
  iconSize,
  isLoading = false,
  loadingLocation: _loadingLocation,
  spinnerClassName,
  spinnerSize,
  ...props
}: ButtonContentProps) => {
  const { leftIcon, loadingLocation, rightIcon } = parseIconsAndLoadingLocation({
    icon,
    loadingLocation: _loadingLocation,
  });

  const commonIconProps = {
    iconClassName,
    iconSize,
    isLoading,
    loadingLocation,
    spinnerClassName,
    spinnerSize,
  };

  return (
    <div
      {...props}
      className={classNames('button__content', props.className)}
      style={{ ...props.style, gap: gap === undefined ? undefined : sizeToString(gap, 'px') }}
    >
      {leftIcon && (isIconProp(leftIcon) || typeof leftIcon === 'string') ? (
        <ContentIcon {...commonIconProps} icon={leftIcon} location='left' />
      ) : (
        <RenderOrSpinner {...commonIconProps} location='left'>
          {leftIcon}
        </RenderOrSpinner>
      )}
      <div
        className={classNames('button__sub-content', {
          'opacity-0': isLoading && loadingLocation === 'over',
        })}
      >
        {children}
      </div>
      <Spinner
        className={classNames('absolute mx-auto', iconClassName, spinnerClassName)}
        isLoading={isLoading ? loadingLocation === 'over' : false}
        size={spinnerSize ?? toIconSize(iconSize)}
      />
      {rightIcon && (isIconProp(rightIcon) || typeof rightIcon === 'string') ? (
        <ContentIcon {...commonIconProps} icon={rightIcon} location='right' />
      ) : rightIcon ? (
        <RenderOrSpinner {...commonIconProps} location='right'>
          {rightIcon}
        </RenderOrSpinner>
      ) : null}
    </div>
  );
};

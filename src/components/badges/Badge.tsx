import { type JSX, type MouseEvent, type ReactNode } from 'react';

import { IconButton } from '~/components/buttons';
import { type IconName, type IconProp, isIconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import {
  type BorderRadius,
  classNames,
  type ComponentProps,
  parseDataAttributes,
} from '~/components/types';
import { BaseTypography, type BaseTypographyProps } from '~/components/typography/BaseTypography';

import { type BadgeSize, BadgeSizes } from './types';

export interface BadgeProps extends Omit<BaseTypographyProps<'div'>, 'component' | 'lineClamp'> {
  readonly children: ReactNode;
  readonly icon?: IconName | IconProp | JSX.Element | null;
  readonly iconClassName?: ComponentProps['className'];
  readonly onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
  readonly radius?: BorderRadius;
  readonly size?: BadgeSize;
}

export const Badge = ({
  children,
  icon,
  iconClassName,
  onClose,
  radius,
  size = BadgeSizes.SM,
  ...props
}: BadgeProps): JSX.Element => (
  <BaseTypography<'div'>
    {...props}
    component='div'
    {...parseDataAttributes({ radius, size })}
    className={classNames(
      'badge',
      { 'pointer-events-auto cursor-pointer': props.onClick !== undefined },
      props.className,
    )}
  >
    <div className='badge__content'>
      {typeof icon === 'string' || isIconProp(icon) ? (
        <Icon className={classNames('badge__icon', iconClassName)} icon={icon} />
      ) : (
        icon
      )}
      <div className='badge__text'>{children}</div>
      {onClose ? (
        <IconButton.Transparent
          className='badge__close-button hover:bg-transparent'
          element='button'
          icon='xmark'
          onClick={e => {
            e.stopPropagation();
            onClose(e);
          }}
          scheme='light'
        />
      ) : null}
    </div>
  </BaseTypography>
);

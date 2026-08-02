import { type JSX } from 'react';

import { type IconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { classNames, type ComponentProps } from '~/components/types';
import { type QuantitativeSize, sizeToString } from '~/components/types/sizes';
import { BaseTypography, type BaseTypographyProps } from '~/components/typography/BaseTypography';

export interface TagProps extends Omit<BaseTypographyProps<'div'>, 'component'> {
  readonly children: string;
  readonly gap?: QuantitativeSize<'px'>;
  readonly icon?: IconProp;
  readonly iconClassName?: ComponentProps['className'];
}

export const Tag = ({
  children,
  gap = '4px',
  icon,
  iconClassName,
  ...props
}: TagProps): JSX.Element => (
  <BaseTypography
    {...props}
    className={classNames('tag', props.className)}
    component='div'
    style={{ ...props.style, gap: sizeToString(gap, 'px' as const) }}
  >
    <div className='tag__content'>
      {icon && <Icon className={classNames('tag__icon', iconClassName)} icon={icon} />}
      <div className='tag__text'>{children}</div>
    </div>
  </BaseTypography>
);

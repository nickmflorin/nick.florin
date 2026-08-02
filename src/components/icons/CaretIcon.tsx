'use client';
import { type ComponentProps as ReactComponentProps } from 'react';

import { motion } from 'framer-motion';

import { type IconName, type IconProp, type IconSize } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { type ClassName, classNames, type ComponentProps } from '~/components/types';

export interface CaretIconProps
  extends
    ComponentProps,
    Omit<ReactComponentProps<typeof motion.div>, 'animate' | 'className' | 'initial' | 'style'> {
  readonly icon?: IconName | IconProp;
  readonly iconClassName?: ClassName;
  readonly isOpen: boolean;
  readonly size?: IconSize;
}

export const CaretIcon = ({
  icon = 'chevron-up',
  iconClassName,
  isOpen,
  size,
  ...props
}: CaretIconProps) => (
  <motion.div
    {...props}
    animate={{ rotate: isOpen ? 180 : 0 }}
    className={classNames(
      'flex flex-col items-center justify-center h-fit max-h-fit',
      props.className,
    )}
    initial={{ rotate: 0 }}
    key='0'
  >
    <Icon className={classNames('text-body', iconClassName)} icon={icon} size={size} />
  </motion.div>
);

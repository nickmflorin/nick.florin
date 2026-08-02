import { type FontAwesomeIconProp, type IconName, type IconProps } from '~/components/icons/types';
import { classNames } from '~/components/types';

import { NativeIcon, type NativeIconProps } from './NativeIcon';
import { getFontAwesomeIconClassName } from './util';

export interface FontAwesomeIconProps
  extends NativeIconProps, Pick<IconProps, 'family' | 'iconStyle'> {
  readonly icon: FontAwesomeIconProp | IconName;
}

export const FontAwesomeIcon = ({
  family,
  icon,
  iconStyle,
  ref,
  ...props
}: FontAwesomeIconProps) => (
  <NativeIcon
    {...props}
    className={classNames(
      getFontAwesomeIconClassName(
        typeof icon === 'string'
          ? { family, iconStyle, name: icon }
          : { family, iconStyle, ...icon },
      ),
      props.className,
    )}
    ref={ref}
  />
);

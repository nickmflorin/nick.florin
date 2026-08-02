import Image from 'next/image';
import { type JSX, type Ref } from 'react';

import { type IconProps, isSvgIconProp } from '~/components/icons';
import { classNames } from '~/components/types';

import { Spinner } from '../Spinner';

import { FontAwesomeIcon } from './FontAwesomeIcon';
import { NativeIcon } from './NativeIcon';
import { getNativeIconStyle } from './util';

/**
 * Renders an icon element, <i>, with the appropriate class name, style and data-attributes.
 *
 * The icon can either be a Font Awesome icon (provided as either the 'icon' {@link IconProp} prop
 * or the 'name', {@link IconName}, 'family', {@link IconFamily}, and 'style', {@link IconStyle}
 * props), or a more general SVG component - provided as a child to the component.
 *
 * When the icon being rendered is a Font Awesome icon, the class names attributed to the <i>
 * element will allow the FontAwesome package to nest an <svg> element corresponding to the
 * appropriate Font Awesome icon inside of the <i> element.
 */
export const Icon = ({
  children,
  icon,
  isLoading,
  ref,
  spinnerClassName,
  spinnerSize,
  style,
  ...props
}: { readonly ref?: Ref<HTMLElement> } & IconProps): JSX.Element => {
  if (isLoading) {
    return (
      <Spinner
        className={classNames(props.className, spinnerClassName)}
        isLoading
        size={spinnerSize ?? props.size}
        style={style}
      />
    );
  } else if (icon !== undefined) {
    if (isSvgIconProp(icon)) {
      return (
        <Image
          alt='Icon'
          className={classNames('icon', props.className)}
          height={typeof props.size === 'number' ? props.size : 16}
          src={icon}
          style={{ ...style, ...getNativeIconStyle(props) }}
          width={typeof props.size === 'number' ? props.size : 16}
        />
      );
    }
    return <FontAwesomeIcon {...props} icon={icon} ref={ref} style={style} />;
  }
  return (
    <NativeIcon {...props} ref={ref} style={style}>
      {children}
    </NativeIcon>
  );
};

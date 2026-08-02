'use client';
import Image from 'next/image';
import { type JSX, type ReactNode, useState } from 'react';

import { type IconName, type IconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { Loading } from '~/components/loading/Loading';
import {
  type BorderRadius,
  classNames,
  type ComponentProps,
  inferQuantitativeSizeValue,
  parseDataAttributes,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

/**
 * Returns the numeric dimension passed to `next/image`'s `height` and `width` props for the
 * avatar image.
 *
 * The image is constrained to expand to fill its container in SASS, so this value is mostly to
 * satisfy Next.js's image optimization requirements and will not actually be used in practice.
 */
const getAvatarImageDimension = (size: QuantitativeSize<'px'> | undefined): number =>
  size ? inferQuantitativeSizeValue(size) : 24;

export interface AvatarProps extends ComponentProps {
  readonly alt?: string;
  readonly children?: ReactNode;
  readonly fallbackIcon?: IconName | IconProp;
  readonly fallbackText?: string;
  readonly hasPriority?: boolean;
  readonly icon?: IconName | IconProp;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: QuantitativeSize<'px'>;
  readonly imageClassName?: ComponentProps['className'];
  readonly isLoading?: boolean;
  readonly radius?: BorderRadius;
  readonly size?: QuantitativeSize<'px'>;
  readonly src?: null | string;
}

export const Avatar = ({
  alt,
  children,
  fallbackIcon,
  fallbackText,
  hasPriority,
  icon = { name: 'image' },
  iconClassName,
  iconSize = '24px',
  imageClassName,
  isLoading,
  radius = 'full',
  size,
  src,
  ...props
}: AvatarProps): JSX.Element => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      {...props}
      {...parseDataAttributes({ radius, withoutImage: failed || !src || src.trim() === '' })}
      className={classNames('avatar', props.className)}
      style={
        size
          ? { ...props.style, height: sizeToString(size, 'px'), width: sizeToString(size, 'px') }
          : props.style
      }
    >
      <Loading isLoading={isLoading} />
      {!failed && src && src.trim() !== '' ? (
        <Image
          alt={alt ?? ''}
          className={classNames('avatar__image', imageClassName)}
          height={getAvatarImageDimension(size)}
          onError={() => setFailed(true)}
          priority={hasPriority}
          src={src}
          width={getAvatarImageDimension(size)}
        />
      ) : failed && fallbackText ? (
        fallbackText
      ) : failed && fallbackIcon ? (
        <Icon
          className={classNames('icon text-gray-700', iconClassName)}
          icon={fallbackIcon}
          size={iconSize ? sizeToString(iconSize, 'px') : undefined}
        />
      ) : children ? (
        children
      ) : (
        <Icon
          className={classNames(iconClassName)}
          icon={icon}
          size={iconSize ? sizeToString(iconSize, 'px') : undefined}
        />
      )}
    </div>
  );
};

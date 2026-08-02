import Image from 'next/image';

import { type Optional } from 'utility-types';

import { type IconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { Loading } from '~/components/loading/Loading';
import {
  BorderRadii,
  type BorderRadius,
  classNames,
  type ComponentProps,
  parseDataAttributes,
} from '~/components/types';

import { type ImageProp } from './types';

type BaseModelImageProps = {
  readonly alt?: string;
  readonly fallbackIcon?: IconProp;
  readonly hasPriority?: boolean;
  readonly imageClassName?: ComponentProps['className'];
  readonly loading?: boolean;
  readonly radius?: BorderRadius;
} & ComponentProps;

export type ModelImageSpreadProps = {
  readonly image?: never;
} & BaseModelImageProps &
  ImageProp;

type ModelImageExplicitProps = {
  readonly image: Omit<ImageProp, 'size'>;
} & BaseModelImageProps &
  Partial<Record<Exclude<keyof ImageProp, 'size'>, never>> &
  Pick<ImageProp, 'size'>;

type ModelImageExplicitSizeOverwriteProps = {
  readonly image: ImageProp;
} & BaseModelImageProps &
  Optional<Pick<ImageProp, 'size'>, 'size'> &
  Partial<Record<Exclude<keyof ImageProp, 'size'>, never>>;

export type ModelImageProps =
  ModelImageExplicitProps | ModelImageExplicitSizeOverwriteProps | ModelImageSpreadProps;

/**
 * Returns the value for property `k` of {@link ImageProp}, preferring an explicit prop provided at
 * the top level of {@link ModelImageProps} over the corresponding property nested under `image`.
 */
const getImageVar = <K extends keyof ImageProp>(
  k: K,
  props: Pick<ModelImageProps, 'image' | K>,
): ImageProp[K] => {
  if (props[k] === undefined) {
    /* It is safe to force coerce here because the only missing property would be size, in which
       case it will simply be undefined. */
    return props.image ? (props.image as ImageProp)[k] : (props[k] as ImageProp[K]);
  }
  return props[k] as ImageProp[K];
};

/** @deprecated */
export const ModelImage = ({
  alt = '',
  className,
  fallbackIcon = { name: 'image' },
  hasPriority,
  image,
  imageClassName,
  loading,
  radius = BorderRadii.NONE,
  size,
  style,
  url,
}: ModelImageProps) => {
  const _url = getImageVar('url', { image, url });
  const _size = getImageVar('size', { image, size });
  return (
    <div
      className={classNames('model-image', className)}
      style={{ ...style, height: size, width: size }}
    >
      <Loading isLoading={loading === true} />
      {_url !== undefined && _url !== null && _url.trim() !== '' ? (
        <Image
          {...parseDataAttributes({ radius })}
          alt={alt}
          className={classNames('model-image__image', imageClassName)}
          height={_size}
          priority={hasPriority}
          src={_url}
          width={_size}
        />
      ) : (
        <div className='model-image__fallback'>
          <Icon icon={fallbackIcon} />
        </div>
      )}
    </div>
  );
};

import Image from "next/image";
import React from "react";

import { type Optional } from "utility-types";

import { type IconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Loading } from "~/components/loading/Loading";
import { classNames, parseDataAttributes } from "~/components/types";
import { type ComponentProps, BorderRadii, type BorderRadius } from "~/components/types";

import { type ImageProp } from "./types";

type BaseModelImageProps = ComponentProps & {
  readonly fallbackIcon?: IconProp;
  readonly alt?: string;
  readonly loading?: boolean;
  readonly radius?: BorderRadius;
  readonly priority?: boolean;
  readonly imageClassName?: ComponentProps["className"];
};

export type ModelImageSpreadProps = BaseModelImageProps &
  ImageProp & {
    readonly image?: never;
  };

type ModelImageExplicitProps = BaseModelImageProps &
  Pick<ImageProp, "size"> & { [key in Exclude<keyof ImageProp, "size">]?: never } & {
    readonly image: Omit<ImageProp, "size">;
  };

type ModelImageExplicitSizeOverwriteProps = BaseModelImageProps &
  Optional<Pick<ImageProp, "size">, "size"> & {
    [key in Exclude<keyof ImageProp, "size">]?: never;
  } & {
    readonly image: ImageProp;
  };

export type ModelImageProps =
  | ModelImageSpreadProps
  | ModelImageExplicitProps
  | ModelImageExplicitSizeOverwriteProps;

const getImageVar = <K extends keyof ImageProp>(
  k: K,
  props: Pick<ModelImageProps, "image" | K>,
): ImageProp[K] => {
  /* Explicit props in top level spread take precedence/are used to override potential props nested
     under 'image'. */
  if (props[k] === undefined) {
    /* It is safe to force coerce here because the only missing property would be size, in which
       case it will simply be undefined. */
    return props.image ? (props.image as ImageProp)[k] : (props[k] as ImageProp[K]);
  }
  return props[k] as ImageProp[K];
};

/** @deprecated */
export const ModelImage = ({
  fallbackIcon = { name: "image" },
  alt = "",
  url,
  size,
  className,
  style,
  image,
  radius = BorderRadii.NONE,
  imageClassName,
  loading,
  priority,
}: ModelImageProps) => {
  const _url = getImageVar("url", { image, url });
  const _size = getImageVar("size", { image, size });
  return (
    <div
      style={{ ...style, height: size, width: size }}
      className={classNames("model-image", className)}
    >
      <Loading isLoading={loading === true} />
      {_url !== undefined && _url !== null && _url.trim() !== "" ? (
        <Image
          {...parseDataAttributes({ radius })}
          height={_size}
          width={_size}
          src={_url}
          alt={alt}
          priority={priority}
          className={classNames("model-image__image", imageClassName)}
        />
      ) : (
        <div className="model-image__fallback">
          <Icon icon={fallbackIcon} />
        </div>
      )}
    </div>
  );
};

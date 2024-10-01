"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { type IconProp, type IconName } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Loading } from "~/components/loading/Loading";
import {
  type ComponentProps,
  type QuantitativeSize,
  classNames,
  sizeToString,
  inferQuantitativeSizeValue,
  type BorderRadius,
} from "~/components/types";

export interface AvatarProps extends ComponentProps {
  readonly src?: string | null;
  readonly size?: QuantitativeSize<"px">;
  readonly radius?: BorderRadius;
  readonly icon?: IconProp | IconName;
  readonly iconClassName?: ComponentProps["className"];
  readonly iconSize?: QuantitativeSize<"px">;
  readonly alt?: string;
  readonly isLoading?: boolean;
  readonly priority?: boolean;
  readonly imageClassName?: ComponentProps["className"];
  readonly children?: ReactNode;
  readonly fallbackText?: string;
  readonly fallbackIcon?: IconProp | IconName;
}

export const Avatar = ({
  src,
  size,
  radius = "full",
  icon = { name: "image" },
  alt,
  isLoading,
  fallbackText,
  iconClassName,
  fallbackIcon,
  priority,
  children,
  imageClassName,
  iconSize = "24px",
  ...props
}: AvatarProps): JSX.Element => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      {...props}
      className={classNames(
        "avatar",
        `avatar--radius-${radius}`,
        { "avatar--without-image": failed || !src || src.trim() === "" },
        props.className,
      )}
      style={
        size
          ? { ...props.style, height: sizeToString(size, "px"), width: sizeToString(size, "px") }
          : props.style
      }
    >
      <Loading isLoading={isLoading} />
      {!failed && src && src.trim() !== "" ? (
        <Image
          /* The image is constrained to expand to fill the container in SASS - so the numbers here
             are mostly to satisfy NetJS for image optimization - but won't actually be used in
             practice. */
          height={size ? inferQuantitativeSizeValue(size) : 24}
          width={size ? inferQuantitativeSizeValue(size) : 24}
          src={src}
          alt={alt ?? ""}
          priority={priority}
          className={classNames("avatar__image", imageClassName)}
          onError={() => setFailed(true)}
        />
      ) : failed && fallbackText ? (
        fallbackText
      ) : failed && fallbackIcon ? (
        <Icon
          icon={fallbackIcon}
          className={classNames("icon text-gray-700", iconClassName)}
          size={iconSize ? sizeToString(iconSize, "px") : undefined}
        />
      ) : children ? (
        children
      ) : (
        <Icon
          icon={icon}
          className={classNames(iconClassName)}
          size={iconSize ? sizeToString(iconSize, "px") : undefined}
        />
      )}
    </div>
  );
};

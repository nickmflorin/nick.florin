"use client";
import Image from "next/image";
import { useState } from "react";
import { type ReactNode } from "react";

import { motion } from "framer-motion";

import { Skeleton } from "~/components/loading/Skeleton";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

import { Caption } from "./Caption";

export interface ProjectImageProps extends ComponentProps {
  readonly src: string;
  readonly caption: ReactNode;
  readonly alt: string;
  readonly wrapperClassName?: ComponentProps["className"];
  readonly captionCentered?: boolean;
  readonly unoptimized?: boolean;
}

export const ProjectImage = ({
  src,
  caption,
  alt,
  captionCentered = false,
  wrapperClassName,
  unoptimized,
  ...props
}: ProjectImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div {...props} className={classNames("project-image-container", props.className)}>
      <div className={classNames("project-image md:mx-auto max-md:gap-[8px] max-w-full")}>
        <div className={classNames("project-image-wrapper", wrapperClassName)}>
          <ShowHide show={isLoading}>
            <Skeleton className="w-full aspect-w-16 aspect-h-9" />
          </ShowHide>
          <motion.div
            className="max-h-full h-full"
            initial={{ opacity: 0 }}
            animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Image
              height={420}
              width={760}
              // layout="responsive"
              unoptimized={unoptimized}
              priority={true}
              src={src}
              alt={alt}
              className={classNames("project-image-image w-full h-full max-w-full", {
                hidden: isLoading,
              })}
              onLoad={() => setIsLoading(false)}
            />
          </motion.div>
        </div>
        <Caption isLoading={isLoading} centered={captionCentered}>
          {caption}
        </Caption>
      </div>
    </div>
  );
};

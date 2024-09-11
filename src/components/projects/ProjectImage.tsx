"use client";
import Image from "next/image";
import { useState } from "react";
import { type ReactNode } from "react";

import { Skeleton } from "@mantine/core";
import clsx from "clsx";
import { motion } from "framer-motion";

import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

import { Caption } from "./Caption";

export interface ProjectImageProps extends ComponentProps {
  readonly src: string;
  readonly caption: ReactNode;
  readonly alt: string;
}

export const ProjectImage = ({ src, caption, alt, ...props }: ProjectImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div {...props} className={clsx("project-image-container", props.className)}>
      <div
        {...props}
        className={clsx(
          "project-image md:w-[840px] md:mx-auto max-md:gap-[8px] max-w-full",
          props.className,
        )}
      >
        <div className="project-image-wrapper">
          <ShowHide show={isLoading}>
            <Skeleton height={400} width="100%" />
          </ShowHide>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Image
              height={420}
              width={760}
              layout="responsive"
              priority={true}
              src={src}
              alt={alt}
              className={clsx("project-image-image w-full h-full max-w-full", {
                hidden: isLoading,
              })}
              onLoad={() => setIsLoading(false)}
            />
          </motion.div>
        </div>
        <Caption isLoading={isLoading}>{caption}</Caption>
      </div>
    </div>
  );
};

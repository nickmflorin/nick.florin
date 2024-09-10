"use client";
import Image from "next/image";
import { useState } from "react";
import { type ReactNode } from "react";

import { Skeleton } from "@mantine/core";
import clsx from "clsx";
import { motion } from "framer-motion";

import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { ShowHide } from "~/components/util";

interface CaptionProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isLoading: boolean;
}

const Caption = ({ children, isLoading, ...props }: CaptionProps) => (
  <div {...props} className={clsx("relative flex flex-col w-full items-center", props.className)}>
    <div
      className={clsx(
        "flex flex-col items-center gap-[6px]",
        "max-w-[90%] min-w-[90%] max-md:max-w-full max-md:min-w-full",
      )}
    >
      <ShowHide show={isLoading}>
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="100%" />
      </ShowHide>
      <ShowHide show={!isLoading}>
        {(Array.isArray(children) ? children : [children]).map((c, index) => (
          <Text key={index} className="text-description text-sm max-md:text-xs text-left">
            {c}
          </Text>
        ))}
      </ShowHide>
    </div>
  </div>
);

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

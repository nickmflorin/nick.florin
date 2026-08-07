'use client';
import Image from 'next/image';
import { type ReactNode, useState } from 'react';

import { motion } from 'framer-motion';

import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { ShowHide } from '~/components/util';

import { Caption } from './Caption';

export interface ProjectImageProps extends ComponentProps {
  readonly alt: string;
  readonly caption: ReactNode;
  /**
   * Whether the image is fetched eagerly and preloaded rather than lazily.
   *
   * Reserve this for an image that is genuinely above the fold. Every project image previously
   * set it unconditionally, which made Next emit a `<link rel="preload">` for each one — so
   * visiting a project page began high-priority fetches for every screenshot and screen recording
   * on it, including the ones several sections down.
   *
   * @default false
   */
  readonly hasPriority?: boolean;
  readonly isCaptionCentered?: boolean;
  readonly isUnoptimized?: boolean;
  readonly src: string;
  readonly wrapperClassName?: ComponentProps['className'];
}

export const ProjectImage = ({
  alt,
  caption,
  hasPriority = false,
  isCaptionCentered = false,
  isUnoptimized,
  src,
  wrapperClassName,
  ...props
}: ProjectImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div {...props} className={classNames('project-image-container', props.className)}>
      <div className={classNames('project-image md:mx-auto max-md:gap-[8px] max-w-full')}>
        <div className={classNames('project-image-wrapper', wrapperClassName)}>
          {/* The placeholder overlays the image rather than displacing it. A lazily-loaded image
              is only fetched once it intersects the viewport, and an image removed from the
              layout with 'display: none' never does - it would sit unfetched behind a skeleton
              that never resolves. Overlaying also lets the image reserve its own space, so the
              swap costs no layout shift. */}
          <ShowHide show={isLoading}>
            <Skeleton className='absolute inset-0 z-10 h-full w-full' />
          </ShowHide>
          <motion.div
            animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
            className='max-h-full h-full'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <Image
              alt={alt}
              className={classNames('project-image-image w-full h-full max-w-full')}
              height={420}
              onLoad={() => setIsLoading(false)}
              priority={hasPriority}
              src={src}
              unoptimized={isUnoptimized}
              width={760}
            />
          </motion.div>
        </div>
        <Caption isCentered={isCaptionCentered} isLoading={isLoading}>
          {caption}
        </Caption>
      </div>
    </div>
  );
};

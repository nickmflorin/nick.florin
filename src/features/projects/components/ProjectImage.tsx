'use client';
import Image from 'next/image';
import { useState } from 'react';

import { classNames } from '~/components/types';

import { ProjectMediaFrame, type ProjectMediaFrameProps } from './ProjectMediaFrame';

export interface ProjectImageProps extends Omit<ProjectMediaFrameProps, 'children' | 'isLoading'> {
  readonly alt: string;
  /**
   * Whether the image is fetched eagerly and preloaded rather than lazily.
   *
   * Reserve this for an image that is genuinely above the fold. Every project image previously
   * set it unconditionally, which made Next emit a `<link rel="preload">` for each one — so
   * visiting a project page began high-priority fetches for every screenshot on it, including the
   * ones several sections down.
   *
   * @default false
   */
  readonly hasPriority?: boolean;
  readonly isUnoptimized?: boolean;
  readonly src: string;
}

/**
 * The width the image occupies at each viewport, measured from the rendered layout: it tracks the
 * content column up to roughly 1024px and is capped at 884px above it.
 *
 * Without this, `next/image` describes its candidates by pixel density instead of by width, which
 * makes the choice depend only on the device's DPR and not at all on how much room the image
 * actually has. Every screen at 2x therefore received the same 1920px file - reasonable for the
 * 884px desktop slot, and roughly five times the pixels needed for the 354px slot on a phone.
 */
const ProjectImageSizes = '(max-width: 1024px) 90vw, 900px';

export const ProjectImage = ({
  alt,
  hasPriority = false,
  isUnoptimized,
  src,
  ...props
}: ProjectImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <ProjectMediaFrame {...props} isLoading={isLoading}>
      <Image
        alt={alt}
        className={classNames('project-image-image w-full h-full max-w-full')}
        height={420}
        onLoad={() => setIsLoading(false)}
        priority={hasPriority}
        sizes={ProjectImageSizes}
        src={src}
        unoptimized={isUnoptimized}
        width={760}
      />
    </ProjectMediaFrame>
  );
};

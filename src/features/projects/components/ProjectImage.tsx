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
  readonly isCaptionCentered?: boolean;
  readonly isUnoptimized?: boolean;
  readonly src: string;
  readonly wrapperClassName?: ComponentProps['className'];
}

export const ProjectImage = ({
  alt,
  caption,
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
          <ShowHide show={isLoading}>
            <Skeleton className='w-full aspect-w-16 aspect-h-9' />
          </ShowHide>
          <motion.div
            animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
            className='max-h-full h-full'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <Image
              alt={alt}
              className={classNames('project-image-image w-full h-full max-w-full', {
                hidden: isLoading,
              })}
              height={420}
              onLoad={() => setIsLoading(false)}
              priority
              src={src}
              // layout="responsive"
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

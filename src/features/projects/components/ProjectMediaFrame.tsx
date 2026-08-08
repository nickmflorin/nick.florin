'use client';
import { type ReactNode } from 'react';

import { motion } from 'framer-motion';

import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { ShowHide } from '~/components/util';

import { Caption } from './Caption';

export interface ProjectMediaFrameProps extends ComponentProps {
  readonly caption: ReactNode;
  readonly children: ReactNode;
  readonly isCaptionCentered?: boolean;
  readonly isLoading: boolean;
  readonly wrapperClassName?: ComponentProps['className'];
}

/**
 * The chrome every piece of project media sits in: the bordered frame, the placeholder shown until
 * the media is ready, the fade-in, and the caption beneath.
 *
 * It is shared by {@link ProjectImage} and {@link ProjectVideo} so that a screenshot and a screen
 * recording are framed identically, and so that a change to the loading treatment cannot apply to
 * only one of them.
 */
export const ProjectMediaFrame = ({
  caption,
  children,
  isCaptionCentered = false,
  isLoading,
  wrapperClassName,
  ...props
}: ProjectMediaFrameProps) => (
  <div {...props} className={classNames('project-image-container', props.className)}>
    <div className={classNames('project-image md:mx-auto max-md:gap-[8px] max-w-full')}>
      <div className={classNames('project-image-wrapper', wrapperClassName)}>
        {/* The placeholder overlays the media rather than displacing it. Media that loads lazily
            is only fetched once it intersects the viewport, and an element removed from the layout
            with 'display: none' never does - it would sit unfetched behind a placeholder that
            never resolves. Overlaying also lets the media reserve its own space, so the swap costs
            no layout shift. */}
        <ShowHide show={isLoading}>
          <Skeleton className='absolute inset-0 z-10 h-full w-full' />
        </ShowHide>
        <motion.div
          animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
          className='max-h-full h-full'
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      </div>
      <Caption isCentered={isCaptionCentered} isLoading={isLoading}>
        {caption}
      </Caption>
    </div>
  </div>
);

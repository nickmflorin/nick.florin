'use client';
import { useEffect, useRef, useState } from 'react';

import { ProjectMediaFrame, type ProjectMediaFrameProps } from './ProjectMediaFrame';

export interface ProjectVideoProps extends Omit<ProjectMediaFrameProps, 'children' | 'isLoading'> {
  /**
   * The accessible description of what the recording shows, since a `<video>` has no `alt`.
   */
  readonly label: string;
  /**
   * The path to the recording **without** an extension, as in
   * `/projects/greenbudget/expanding`.
   *
   * Both a `.webm` and an `.mp4` are offered from it, which is what
   * `pnpm run projects:transcode-gifs` emits for every source recording. Taking the stem rather
   * than a full path keeps the two sources from being able to disagree.
   */
  readonly src: string;
}

/**
 * Renders a silent, looping UI screen recording.
 *
 * These were animated GIFs, which no image pipeline can compress and which therefore shipped at
 * their full multi-megabyte size. As video they cost roughly a tenth as much, at the price of
 * having to drive playback by hand: the element is deliberately not `autoplay`, because an
 * autoplaying video is fetched and decoded whether or not it is anywhere near the viewport, which
 * is the cost this change exists to remove. Playback instead starts the first time the recording
 * scrolls into view and pauses when it leaves.
 */
export const ProjectVideo = ({ label, src, ...props }: ProjectVideoProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <ProjectMediaFrame {...props} isLoading={isLoading}>
      <video
        aria-label={label}
        className='project-image-image w-full h-full max-w-full'
        height={420}
        loop
        muted
        onLoadedData={() => setIsLoading(false)}
        playsInline
        preload='none'
        ref={ref}
        width={760}
      >
        <source src={`${src}.webm`} type='video/webm' />
        <source src={`${src}.mp4`} type='video/mp4' />
      </video>
    </ProjectMediaFrame>
  );
};

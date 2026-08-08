import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';

/**
 * The ratio the media reserves space at, taken from the intrinsic dimensions the `ProjectImage`
 * and `ProjectVideo` elements are declared with. Both render at the full width of the frame with
 * an automatic height, so the box they occupy is that width scaled by this ratio.
 */
const ProjectMediaAspectRatio = 'aspect-[760/420]';

/**
 * The height of a single caption line, matching the placeholder lines the caption itself renders
 * while its media loads.
 */
const CaptionLineHeight = 14;

export interface ProjectMediaSkeletonProps extends ComponentProps {
  readonly numCaptionLines?: number;
}

/**
 * Stands in for a screenshot or a screen recording on a project page, rendered through the same
 * frame markup the media itself sits in so that the placeholder reserves the frame's margins, its
 * shadowed border and the caption beneath it, not only the media box.
 */
export const ProjectMediaSkeleton = ({
  numCaptionLines = 2,
  ...props
}: ProjectMediaSkeletonProps) => (
  <div {...props} className={classNames('project-image-container', props.className)}>
    <div className='project-image md:mx-auto max-md:gap-[8px] max-w-full'>
      <div className={classNames('project-image-wrapper', ProjectMediaAspectRatio)}>
        <Skeleton className='absolute inset-0 z-10 h-full w-full' />
      </div>
      <div className='relative flex flex-col w-full items-center'>
        <div
          className={classNames(
            'flex flex-col items-center gap-[6px]',
            'max-w-[90%] min-w-[90%] max-md:max-w-full max-md:min-w-full',
          )}
        >
          {Array.from({ length: numCaptionLines }).map((_, i) => (
            <Skeleton height={CaptionLineHeight} key={i} width='100%' />
          ))}
        </div>
      </div>
    </div>
  </div>
);

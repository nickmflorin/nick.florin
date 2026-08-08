import { BadgeCollectionSkeleton } from '~/components/badges/BadgeCollectionSkeleton';
import { Skeleton, SkeletonLineOffset } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { DescriptionSkeleton } from '~/components/typography/DescriptionSkeleton';
import { RepositoryTileSkeleton } from '~/features/repositories/components/RepositoryTileSkeleton';

import { ProjectMediaSkeleton } from './ProjectMediaSkeleton';

/**
 * Describes the space one section of a project page reserves. A section is prose followed by
 * screenshots or screen recordings, optionally introduced by a heading.
 */
export interface ProjectPageSkeletonSection {
  /**
   * Whether the section is introduced by a heading, as opposed to sitting directly beneath the
   * one above it.
   *
   * @default true
   */
  readonly hasTitle?: boolean;
  readonly numDescriptionLines?: number;
  readonly numMedia?: number;
}

export interface ProjectPageSkeletonProps extends ComponentProps {
  readonly numDescriptionLines?: number;
  /**
   * The number of prose lines the yellow disclaimer callout stands in for, or `0` for a project
   * that carries no disclaimer.
   *
   * @default 0
   */
  readonly numDisclaimerLines?: number;
  readonly numRepositories?: number;
  readonly numSkills?: number;
  readonly sections?: readonly ProjectPageSkeletonSection[];
}

/**
 * The streaming fallback for a project page, laid out with the containers, gaps and paddings the
 * page itself renders with.
 *
 * The sections are described by the caller rather than derived, because every project page is
 * hand-written prose: only the page knows how many paragraphs precede its screenshots and how many
 * screenshots follow them.
 */
export const ProjectPageSkeleton = ({
  numDescriptionLines = 6,
  numDisclaimerLines = 0,
  numRepositories = 1,
  numSkills = 24,
  sections = [{ numDescriptionLines: 6, numMedia: 1 }],
  ...props
}: ProjectPageSkeletonProps) => (
  <div
    {...props}
    className={classNames(
      'w-full max-w-[900px] flex flex-col gap-[12px] mx-auto px-[16px] pb-[16px]',
      'max-md:gap-[8px] px-[12px] pb-[12px]',
      'px-[8px] pb-[8px]',
      props.className,
    )}
  >
    <div className='w-full flex flex-col gap-[12px] max-md:gap-[8px]'>
      <div
        className={classNames(
          'flex flex-row sm:items-center gap-4',
          'max-sm:flex-col max-sm:items-start max-sm:gap-2',
        )}
      >
        <Skeleton className={classNames('w-[45%]', SkeletonLineOffset)} height={18} />
      </div>
      <div className='flex flex-col gap-[16px] max-md:gap-[12px]'>
        <DescriptionSkeleton numLines={numDescriptionLines} />
        {numRepositories > 0 ? (
          <div className='flex flex-row gap-[10px] mb-2 max-sm:flex-col'>
            {Array.from({ length: numRepositories }).map((_, i) => (
              <RepositoryTileSkeleton key={i} />
            ))}
          </div>
        ) : null}
        {numDisclaimerLines > 0 ? (
          <div
            className={classNames(
              'flex flex-col gap-[8px] mb-2',
              'w-full max-w-[900px] mx-auto',
              'bg-yellow-50 border border-yellow-400 rounded-md',
              'px-[16px] py-[12px] max-md:px-[12px] max-md:py-[8px]',
            )}
          >
            <Skeleton className={classNames('w-[90px]', SkeletonLineOffset)} height={14} />
            <DescriptionSkeleton numLines={numDisclaimerLines} />
          </div>
        ) : null}
        <BadgeCollectionSkeleton className='mb-2' numBadges={numSkills} />
      </div>
    </div>
    <div className='flex flex-col gap-[12px] max-md:gap-[8px]'>
      {sections.map((section, i) => (
        <div className='flex flex-col gap-[12px] max-md:gap-[8px]' key={i}>
          {section.hasTitle === false ? null : (
            <div className='flex flex-col gap-[4px]'>
              <Skeleton className={classNames('w-[30%]', SkeletonLineOffset)} height={16} />
            </div>
          )}
          {(section.numDescriptionLines ?? 6) > 0 ? (
            <DescriptionSkeleton numLines={section.numDescriptionLines ?? 6} />
          ) : null}
          {Array.from({ length: section.numMedia ?? 1 }).map((_, j) => (
            <ProjectMediaSkeleton key={j} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

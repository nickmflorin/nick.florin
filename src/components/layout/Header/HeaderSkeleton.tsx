import { type JSX } from 'react';

import { Skeleton } from '~/components/loading/Skeleton';

/**
 * Dimensionally mirrors the header's streamed content — {@link ProfileSection}'s 60px profile
 * image with the name/handle lines beside it, and the resume actions or menu button on the right
 * — so that while the header's data resolves, the region reads as a loading header rather than an
 * empty bar that the content later pops into.
 */
export const HeaderSkeleton = (): JSX.Element => (
  <>
    <div className='flex flex-row gap-[16px] items-center'>
      <Skeleton className='!rounded-full' height={60} width={60} />
      <div className='flex flex-col gap-[6px]'>
        <Skeleton height={16} width={140} />
        <Skeleton height={14} width={100} />
      </div>
    </div>
    <div className='header__right'>
      <div className='flex flex-row items-center gap-[8px] max-[450px]:hidden'>
        <Skeleton height={32} width={112} />
        <Skeleton height={32} width={32} />
      </div>
      <Skeleton className='hidden max-[450px]:block' height={32} width={32} />
    </div>
  </>
);

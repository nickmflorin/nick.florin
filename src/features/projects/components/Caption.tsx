import { Fragment, type ReactNode } from 'react';

import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { ShowHide } from '~/components/util';

import { CaptionDescription } from './CaptionDescription';

export interface CaptionProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isCentered?: boolean;
  readonly isLoading: boolean;
}

export const Caption = ({ children, isCentered, isLoading, ...props }: CaptionProps) => (
  <div
    {...props}
    className={classNames('relative flex flex-col w-full items-center', props.className)}
  >
    <div
      className={classNames(
        'flex flex-col items-center gap-[6px]',
        'max-w-[90%] min-w-[90%] max-md:max-w-full max-md:min-w-full',
      )}
    >
      <ShowHide show={isLoading}>
        <Skeleton height={14} width='100%' />
        <Skeleton height={14} width='100%' />
      </ShowHide>
      <ShowHide show={!isLoading}>
        {(Array.isArray(children) ? children : [children]).map((c, index) =>
          typeof c === 'string' ? (
            <CaptionDescription isCentered={isCentered} key={index}>
              {c}
            </CaptionDescription>
          ) : (
            <Fragment key={index}>{c}</Fragment>
          ),
        )}
      </ShowHide>
    </div>
  </div>
);

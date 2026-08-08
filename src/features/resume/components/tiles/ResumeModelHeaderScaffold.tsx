import { type JSX, type ReactNode } from 'react';

import { isFragment } from 'react-is';

import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';
import { ShowHide } from '~/components/util';
import type * as types from '~/features/resume/types';

import { ResumeModelChildrenIndents, ResumeModelImageSizes } from './image-sizes';

export interface ResumeModelHeaderScaffoldProps extends ComponentProps {
  readonly areTagsVisible?: boolean;
  readonly children?: ReactNode;
  /**
   * Renders the image slot, given the responsive height classes for the scaffold's model size. The
   * caller applies them rather than receiving a pixel size, so the image tracks the breakpoint in
   * CSS exactly as the real header's does.
   */
  readonly image: (params: { className: string }) => JSX.Element;
  readonly size: types.ResumeModelSize;
  readonly subTitle: JSX.Element;
  readonly tags: (props: ComponentProps) => JSX.Element;
  readonly title: JSX.Element;
  readonly titleSectionGap?: QuantitativeSize<'px'>;
}

export const ResumeModelHeaderScaffold = ({
  areTagsVisible = true,
  children,
  image,
  size,
  subTitle,
  tags,
  title,
  titleSectionGap,
  ...props
}: ResumeModelHeaderScaffoldProps) => (
  <div
    {...props}
    className={classNames(
      'flex flex-col gap-[8px] @sm/resume-model-tile:gap-[6px]',
      props.className,
    )}
  >
    <div className='flex flex-row gap-[8px] max-w-full w-full overflow-x-hidden'>
      {image({ className: ResumeModelImageSizes[size] })}
      {/* `min-w-0` is what lets this column give way to the image, which does not shrink. */}
      <div
        className={classNames('flex flex-col grow min-w-0 gap-[6px] max-md:gap-[4px]', {
          'pt-[2px] max-sm:pt-[0px]': size === 'large',
        })}
      >
        <div
          className={classNames('flex flex-col', {
            'gap-[2px]': size === 'small' && titleSectionGap === undefined,
            'gap-[4px] max-md:gap-[2px]':
              ['large', 'medium'].includes(size) && titleSectionGap === undefined,
          })}
          style={titleSectionGap === undefined ? {} : { gap: sizeToString(titleSectionGap, 'px') }}
        >
          {title}
          {subTitle}
        </div>
        <ShowHide show={areTagsVisible}>
          {tags({
            className: 'hidden @sm/resume-model-tile:flex @sm/resume-model-tile::gap-[2px]',
          })}
        </ShowHide>
      </div>
    </div>
    <ShowHide show={areTagsVisible}>
      {tags({ className: 'flex @sm/resume-model-tile:hidden' })}
    </ShowHide>
    <ShowHide show={children ? !isFragment(children) : false}>
      <div className={ResumeModelChildrenIndents[size]}>{children}</div>
    </ShowHide>
  </div>
);

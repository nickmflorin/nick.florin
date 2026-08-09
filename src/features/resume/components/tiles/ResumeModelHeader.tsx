import { type ReactNode } from 'react';

import { isFragment } from 'react-is';

import { type BrandModel, type ResumeBrand } from '~/database/model';

import { classNames, type ComponentProps } from '~/components/types';
import { ShowHide } from '~/components/util';
import type * as types from '~/features/resume/types';

import { ResumeModelChildrenIndents, ResumeModelImageSizes } from './image-sizes';
import { ResumeModelImage } from './ResumeModelImage';
import { ResumeModelSubTitle } from './ResumeModelSubTitle';
import { ResumeModelTags } from './ResumeModelTags';
import { ResumeModelTitle } from './ResumeModelTitle';

export interface ResumeModelHeaderProps<
  M extends BrandModel<T>,
  T extends ResumeBrand,
> extends ComponentProps {
  readonly areTagsVisible?: boolean;
  readonly children?: ReactNode;
  readonly isTitleExpandable?: boolean;
  readonly model: M;
  readonly size: types.ResumeModelSize;
  readonly titleProps?: ComponentProps;
}

export const ResumeModelHeader = <M extends BrandModel<T>, T extends ResumeBrand>({
  areTagsVisible = true,
  children,
  isTitleExpandable = false,
  model,
  size,
  titleProps,
  ...props
}: ResumeModelHeaderProps<M, T>) => (
  <div
    {...props}
    className={classNames(
      'flex flex-col gap-[8px] @sm/resume-model-tile:gap-[6px]',
      props.className,
    )}
  >
    <div className='flex flex-row gap-[8px] max-w-full w-full overflow-x-hidden'>
      <ResumeModelImage className={ResumeModelImageSizes[size]} model={model} />
      {/* `min-w-0` is what lets this column give way to the image, which does not shrink. */}
      <div
        className={classNames('flex flex-col grow min-w-0 gap-[6px] max-md:gap-[4px]', {
          'pt-[2px] max-sm:pt-[0px]': size === 'large',
        })}
      >
        <div
          className={classNames('flex flex-col', {
            'gap-[2px]': size === 'small',
            'gap-[4px] max-md:gap-[2px]': size === 'medium' || size === 'large',
          })}
        >
          <ResumeModelTitle
            {...titleProps}
            isExpandable={isTitleExpandable}
            model={model}
            size={size}
          />
          <ResumeModelSubTitle model={model} size={size} />
        </div>
        <ShowHide show={areTagsVisible}>
          <ResumeModelTags
            className='hidden @sm/resume-model-tile:flex @sm/resume-model-tile::gap-[2px]'
            model={model}
          />
        </ShowHide>
      </div>
    </div>
    <ShowHide show={areTagsVisible}>
      <ResumeModelTags className='flex @sm/resume-model-tile:hidden' model={model} />
    </ShowHide>
    <ShowHide show={children ? !isFragment(children) : false}>
      <div className={ResumeModelChildrenIndents[size]}>{children}</div>
    </ShowHide>
  </div>
);

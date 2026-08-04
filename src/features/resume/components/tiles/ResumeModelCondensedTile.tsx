import { type BrandModel, type ResumeBrand } from '~/database/model';

import { type ComponentProps } from '~/components/types';
import { ShowHide } from '~/components/util';
import * as types from '~/features/resume/types';

import { ResumeModelTile } from './ResumeModelTile';

export interface ResumeModelCondensedTileProps<
  M extends BrandModel<T>,
  T extends ResumeBrand,
> extends ComponentProps {
  readonly areTagsVisible?: boolean;
  readonly isDescriptionShowMoreLinkVisible?: boolean;
  readonly isDescriptionVisible?: boolean;
  readonly isTitleExpandable?: boolean;
  readonly model: M;
}

export const ResumeModelCondensedTile = <M extends BrandModel<T>, T extends ResumeBrand>({
  areTagsVisible = true,
  isDescriptionShowMoreLinkVisible = true,
  isDescriptionVisible = true,
  isTitleExpandable,
  model,
  ...props
}: ResumeModelCondensedTileProps<M, T>) => (
  <ResumeModelTile {...props}>
    <ResumeModelTile.Header
      areTagsVisible={areTagsVisible}
      isTitleExpandable={isTitleExpandable}
      model={model}
      size='small'
    >
      <ShowHide show={types.hasDescription(model) ? isDescriptionVisible : false}>
        <ResumeModelTile.ModelDescription
          isShowMoreLinkVisible={isDescriptionShowMoreLinkVisible}
          lineClamp={3}
          model={model}
        />
      </ShowHide>
    </ResumeModelTile.Header>
  </ResumeModelTile>
);

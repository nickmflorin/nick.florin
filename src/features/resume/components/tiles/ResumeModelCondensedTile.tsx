import { type ResumeBrand, type BrandModel } from "~/database/model";

import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";
import * as types from "~/features/resume/types";

import { ResumeModelTile } from "./ResumeModelTile";

export interface ResumeModelCondensedTileProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly showTags?: boolean;
  readonly titleIsExpandable?: boolean;
  readonly includeDescription?: boolean;
  readonly includeDescriptionShowMoreLink?: boolean;
}

export const ResumeModelCondensedTile = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  titleIsExpandable,
  showTags = true,
  includeDescription = true,
  includeDescriptionShowMoreLink = true,
  ...props
}: ResumeModelCondensedTileProps<M, T>) => (
  <ResumeModelTile {...props}>
    <ResumeModelTile.Header
      size="small"
      model={model}
      showTags={showTags}
      titleIsExpandable={titleIsExpandable}
    >
      <ShowHide show={types.hasDescription(model) && includeDescription}>
        <ResumeModelTile.ModelDescription
          lineClamp={3}
          includeShowMoreLink={includeDescriptionShowMoreLink}
          model={model}
        />
      </ShowHide>
    </ResumeModelTile.Header>
  </ResumeModelTile>
);

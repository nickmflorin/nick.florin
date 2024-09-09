import clsx from "clsx";

import { type ResumeBrand, type BrandModel } from "~/prisma/model";

import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

import { ResumeModelTile } from "./ResumeModelTile";
import * as types from "./types";

export interface ResumeModelCondensedTileProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly showTags?: boolean;
  readonly titleIsExpandable?: boolean;
  readonly includeDescription?: boolean;
  readonly pushOnExpandTitle?: boolean;
  readonly includeDescriptionShowMoreLink?: boolean;
}

export const ResumeModelCondensedTile = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  titleIsExpandable,
  pushOnExpandTitle = false,
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
      pushOnExpandTitle={pushOnExpandTitle}
      className={clsx("gap-[4px] max-md:gap-[6px]")}
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

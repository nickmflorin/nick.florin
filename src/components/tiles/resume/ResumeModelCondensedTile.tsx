import { type ResumeBrand, type BrandModel } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

import { ResumeModelTile } from "./ResumeModelTile";
import * as types from "./types";

export interface ResumeModelCondensedTileProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly showBadges?: boolean;
  readonly expandable?: boolean;
  readonly showDescription?: boolean;
  readonly showMoreLink?: boolean;
}

export const ResumeModelCondensedTile = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  expandable,
  showBadges = true,
  showDescription = true,
  showMoreLink = true,
  ...props
}: ResumeModelCondensedTileProps<M, T>) => (
  <ResumeModelTile {...props} gap="4px">
    <div className="flex flex-col gap-[16px] max-w-full w-full">
      <div className="flex flex-row gap-[12px] max-w-full w-full">
        <ResumeModelTile.Image model={model} size="small" />
        <div className="flex flex-col grow gap-[2px]">
          <ResumeModelTile.Title model={model} size="small" expandable={expandable} />
          <ResumeModelTile.SubTitle model={model} size="small" />
          <ShowHide show={showBadges}>
            <ResumeModelTile.Badges model={model} />
          </ShowHide>
        </div>
      </div>
    </div>
    <div className="flex flex-col pl-[40px] gap-[4px]">
      <ShowHide show={types.hasDescription(model) && showDescription}>
        <ResumeModelTile.Description
          model={model}
          fontSize="xs"
          lineClamp={3}
          includeShowMoreLink={showMoreLink}
        />
      </ShowHide>
    </div>
  </ResumeModelTile>
);

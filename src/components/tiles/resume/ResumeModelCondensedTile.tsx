import clsx from "clsx";

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
  <ResumeModelTile {...props} className={clsx("gap-[4px]", props.className)}>
    <ResumeModelTile.Header
      size="small"
      model={model}
      showBadges={showBadges}
      titleIsExpandable={expandable}
    />
    <div className="flex flex-col pl-[40px] gap-[4px]">
      <ShowHide show={types.hasDescription(model) && showDescription}>
        <ResumeModelTile.ModelDescription
          size="small"
          lineClamp={3}
          includeShowMoreLink={showMoreLink}
          model={model}
        />
      </ShowHide>
    </div>
  </ResumeModelTile>
);

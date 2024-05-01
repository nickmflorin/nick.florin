"use client";
import clsx from "clsx";

import type * as types from "./types";

import { type BrandModel, type ResumeBrand } from "~/prisma/model";
import type { ScreenSize, ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

import { ResumeModelBadges } from "./ResumeModelBadges";
import { ResumeModelImage } from "./ResumeModelImage";
import { ResumeModelSubTitle } from "./ResumeModelSubTitle";
import { ResumeModelTitle } from "./ResumeModelTitle";

export const ImageSizes: { [key in types.ResumeModelSize]: { [key in ScreenSize]: number } } = {
  small: { xs: 28, sm: 28, md: 28, lg: 28, xl: 28, "2xl": 28 },
  medium: { xs: 44, sm: 44, md: 44, lg: 44, xl: 44, "2xl": 44 },
  large: { xs: 44, sm: 72, md: 72, lg: 72, xl: 72, "2xl": 72 },
};

export interface ResumeModelHeaderProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly size: types.ResumeModelSize;
  readonly showBadges?: boolean;
  readonly titleIsExpandable?: boolean;
}

export const ResumeModelHeader = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  titleIsExpandable = false,
  showBadges = true,
}: ResumeModelHeaderProps<M, T>) => {
  const { size: screenSize } = useScreenSizes({ defaultSize: "lg" });

  return (
    <div className="flex flex-col max-w-full w-full overflow-y-hidden gap-[10px]">
      <div
        className={clsx(
          "flex flex-row gap-[12px] max-w-full w-full overflow-x-hidden",
          "max-md:gap-[8px]",
        )}
      >
        <ResumeModelImage model={model} size={ImageSizes[size][screenSize]} />
        <div
          className={clsx("flex flex-col grow gap-[4px]", {
            "pt-[2px] max-sm:pt-[0px]": size === "large",
          })}
          style={{ maxWidth: `calc(100% - ${ImageSizes[size][screenSize]}px - 12px)` }}
        >
          <div
            className={clsx("flex flex-col", {
              "gap-[6px] max-sm:gap-[4px]": size === "medium" || size === "large",
              "gap-[2px]": size === "small",
            })}
          >
            <ResumeModelTitle model={model} size={size} expandable={titleIsExpandable} />
            <ResumeModelSubTitle model={model} size={size} />
          </div>
          <ShowHide show={showBadges}>
            <ResumeModelBadges model={model} className="max-md:hidden" />
          </ShowHide>
        </div>
      </div>
      <ShowHide show={showBadges}>
        <ResumeModelBadges model={model} className="md:hidden" />
      </ShowHide>
    </div>
  );
};

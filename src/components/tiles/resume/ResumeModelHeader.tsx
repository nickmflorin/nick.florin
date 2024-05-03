"use client";
import { type ReactNode } from "react";

import clsx from "clsx";
import { isFragment } from "react-is";

import type * as types from "./types";

import { type BrandModel, type ResumeBrand } from "~/prisma/model";
import type { ScreenSize, ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

import { ResumeModelImage } from "./ResumeModelImage";
import { ResumeModelSubTitle } from "./ResumeModelSubTitle";
import { ResumeModelTags } from "./ResumeModelTags";
import { ResumeModelTitle } from "./ResumeModelTitle";

export const ImageSizes: { [key in types.ResumeModelSize]: { [key in ScreenSize]: number } } = {
  small: { xs: 42, sm: 42, md: 42, lg: 42, xl: 42, "2xl": 42 },
  medium: { xs: 44, sm: 44, md: 44, lg: 44, xl: 44, "2xl": 44 },
  large: { xs: 44, sm: 48, md: 72, lg: 72, xl: 72, "2xl": 72 },
};

export interface ResumeModelHeaderProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly size: types.ResumeModelSize;
  readonly showTags?: boolean;
  readonly titleIsExpandable?: boolean;
  readonly children?: ReactNode;
}

const ImageGaps: { [key in types.ResumeModelSize]: { [key in ScreenSize]: number } } = {
  small: { xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
  medium: { xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
  large: { xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
};

export const ResumeModelHeader = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  children,
  titleIsExpandable = false,
  showTags = true,
  ...props
}: ResumeModelHeaderProps<M, T>) => {
  const { size: screenSize, isLessThan } = useScreenSizes({ defaultSize: "lg" });
  const imageSize = ImageSizes[size][screenSize];
  const imageGap = ImageGaps[size][screenSize];

  return (
    <div {...props} className={clsx("flex flex-col", props.className)}>
      <div
        className={clsx("flex flex-row max-w-full w-full overflow-x-hidden")}
        style={{ gap: `${imageGap}px` }}
      >
        <ResumeModelImage model={model} size={imageSize} />
        <div
          className={clsx("flex flex-col grow gap-[6px]", {
            "pt-[2px] max-sm:pt-[0px]": size === "large",
          })}
          style={{ maxWidth: `calc(100% - ${imageSize}px - ${imageGap}px)` }}
        >
          <div
            className={clsx("flex flex-col", {
              "gap-[4px]": size === "medium" || size === "large",
              "gap-[2px]": size === "small",
            })}
          >
            <ResumeModelTitle model={model} size={size} expandable={titleIsExpandable} />
            <ResumeModelSubTitle model={model} size={size} />
          </div>
          <ShowHide show={showTags}>
            <ResumeModelTags model={model} />
          </ShowHide>
        </div>
      </div>
      <ShowHide show={Boolean(children) && !isFragment(children)}>
        <div
          style={
            !isLessThan("md") || size !== "large"
              ? { paddingLeft: `${imageSize + imageGap}px` }
              : {}
          }
        >
          {children}
        </div>
      </ShowHide>
    </div>
  );
};

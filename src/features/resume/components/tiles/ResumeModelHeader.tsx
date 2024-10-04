"use client";
import { type ReactNode } from "react";

import { isFragment } from "react-is";

import { type BrandModel, type ResumeBrand } from "~/database/model";

import type { ComponentProps, Breakpoint } from "~/components/types";
import { classNames } from "~/components/types";
import { ShowHide } from "~/components/util";
import type * as types from "~/features/resume/types";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

import { ResumeModelImage } from "./ResumeModelImage";
import { ResumeModelSubTitle } from "./ResumeModelSubTitle";
import { ResumeModelTags } from "./ResumeModelTags";
import { ResumeModelTitle } from "./ResumeModelTitle";

export const ImageSizes: {
  [key in types.ResumeModelSize]: { [key in Breakpoint | "0"]: number };
} = {
  small: { "0": 42, xxs: 42, xs: 42, sm: 42, md: 42, lg: 42, xl: 42, "2xl": 42 },
  medium: { "0": 42, xxs: 42, xs: 44, sm: 44, md: 44, lg: 44, xl: 44, "2xl": 44 },
  large: { "0": 42, xxs: 42, xs: 44, sm: 48, md: 72, lg: 72, xl: 72, "2xl": 72 },
};

export interface ResumeModelHeaderProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly size: types.ResumeModelSize;
  readonly showTags?: boolean;
  readonly titleIsExpandable?: boolean;
  readonly children?: ReactNode;
  readonly titleProps?: ComponentProps;
}

const ImageGaps: { [key in types.ResumeModelSize]: { [key in Breakpoint | "0"]: number } } = {
  small: { "0": 8, xxs: 8, xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
  medium: { "0": 8, xxs: 8, xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
  large: { "0": 8, xxs: 8, xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
};

export const ResumeModelHeader = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  children,
  titleProps,
  titleIsExpandable = false,
  showTags = true,
  ...props
}: ResumeModelHeaderProps<M, T>) => {
  const { breakpoint, isLessThanOrEqualTo } = useScreenSizes();
  const imageSize = ImageSizes[size][breakpoint];
  const imageGap = ImageGaps[size][breakpoint];

  return (
    <div
      {...props}
      className={classNames(
        "flex flex-col gap-[8px] @sm/resume-model-tile:gap-[6px]",
        props.className,
      )}
    >
      <div
        className={classNames("flex flex-row max-w-full w-full overflow-x-hidden")}
        style={{ gap: `${imageGap}px` }}
      >
        <ResumeModelImage model={model} size={imageSize} />
        <div
          className={classNames("flex flex-col grow gap-[6px] max-md:gap-[4px]", {
            "pt-[2px] max-sm:pt-[0px]": size === "large",
          })}
          style={{ maxWidth: `calc(100% - ${imageSize}px - ${imageGap}px)` }}
        >
          <div
            className={classNames("flex flex-col", {
              "gap-[4px] max-md:gap-[2px]": size === "medium" || size === "large",
              "gap-[2px]": size === "small",
            })}
          >
            <ResumeModelTitle
              {...titleProps}
              model={model}
              size={size}
              expandable={titleIsExpandable}
            />
            <ResumeModelSubTitle model={model} size={size} />
          </div>
          <ShowHide show={showTags}>
            <ResumeModelTags
              model={model}
              className="hidden @sm/resume-model-tile:flex @sm/resume-model-tile::gap-[2px]"
            />
          </ShowHide>
        </div>
      </div>
      <ShowHide show={showTags}>
        <ResumeModelTags model={model} className="flex @sm/resume-model-tile:hidden" />
      </ShowHide>
      <ShowHide show={Boolean(children) && !isFragment(children)}>
        <div
          className={classNames({
            "@sm/resume-model-tile:pl-[50px]":
              size === "small" ||
              (size === "medium" && isLessThanOrEqualTo("xxs")) ||
              (size === "large" && isLessThanOrEqualTo("xxs")),
            "@sm/resume-model-tile:pl-[52px]":
              (size === "medium" && !isLessThanOrEqualTo("xxs")) ||
              (size === "large" && breakpoint === "xs"),
            "@sm/resume-model-tile:pl-[56px]": size === "large" && breakpoint === "sm",
            "@sm/resume-model-tile:pl-[80px]": size === "large" && !isLessThanOrEqualTo("sm"),
          })}
        >
          {children}
        </div>
      </ShowHide>
    </div>
  );
};

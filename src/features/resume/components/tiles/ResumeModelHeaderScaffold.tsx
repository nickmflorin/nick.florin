import { type ReactNode } from "react";

import { isFragment } from "react-is";

import type { ComponentProps, Breakpoint, QuantitativeSize } from "~/components/types";
import { classNames, sizeToString } from "~/components/types";
import { ShowHide } from "~/components/util";
import type * as types from "~/features/resume/types";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

export const ImageSizes: {
  [key in types.ResumeModelSize]: { [key in Breakpoint | "0"]: number };
} = {
  small: { "0": 42, xxs: 42, xs: 42, sm: 42, md: 42, lg: 42, xl: 42, "2xl": 42 },
  medium: { "0": 42, xxs: 42, xs: 44, sm: 44, md: 44, lg: 44, xl: 44, "2xl": 44 },
  large: { "0": 42, xxs: 42, xs: 44, sm: 48, md: 72, lg: 72, xl: 72, "2xl": 72 },
};

export interface ResumeModelHeaderScaffoldProps extends ComponentProps {
  readonly title: JSX.Element;
  readonly subTitle: JSX.Element;
  readonly size: types.ResumeModelSize;
  readonly showTags?: boolean;
  readonly children?: ReactNode;
  readonly titleSectionGap?: QuantitativeSize<"px">;
  readonly tags: (props: ComponentProps) => JSX.Element;
  readonly image: (params: { size: number }) => JSX.Element;
}

const ImageGaps: { [key in types.ResumeModelSize]: { [key in Breakpoint | "0"]: number } } = {
  small: { "0": 8, xxs: 8, xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
  medium: { "0": 8, xxs: 8, xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
  large: { "0": 8, xxs: 8, xs: 8, sm: 8, md: 8, lg: 8, xl: 8, "2xl": 8 },
};

export const ResumeModelHeaderScaffold = ({
  title,
  subTitle,
  size,
  children,
  showTags = true,
  titleSectionGap,
  tags,
  image,
  ...props
}: ResumeModelHeaderScaffoldProps) => {
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
        {image({ size: imageSize })}
        <div
          className={classNames("flex flex-col grow gap-[6px] max-md:gap-[4px]", {
            "pt-[2px] max-sm:pt-[0px]": size === "large",
          })}
          style={{ maxWidth: `calc(100% - ${imageSize}px - ${imageGap}px)` }}
        >
          <div
            style={
              titleSectionGap !== undefined ? { gap: sizeToString(titleSectionGap, "px") } : {}
            }
            className={classNames("flex flex-col", {
              "gap-[4px] max-md:gap-[2px]":
                ["large", "medium"].includes(size) && titleSectionGap === undefined,
              "gap-[2px]": size === "small" && titleSectionGap === undefined,
            })}
          >
            {title}
            {subTitle}
          </div>
          <ShowHide show={showTags}>
            {tags({
              className: "hidden @sm/resume-model-tile:flex @sm/resume-model-tile::gap-[2px]",
            })}
          </ShowHide>
        </div>
      </div>
      <ShowHide show={showTags}>
        {tags({ className: "flex @sm/resume-model-tile:hidden" })}
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

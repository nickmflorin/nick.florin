import { type ReactNode } from "react";

import clsx from "clsx";

import { type BrandModel, type ResumeBrand } from "~/prisma/model";
import { ResumeModelImage } from "~/components/images/ResumeModelImage";
import { LocationTag } from "~/components/tags/LocationTag";
import { TimePeriodTag } from "~/components/tags/TimePeriodTag";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

import { type ResumeModelTileSize } from "./types";

export interface BadgesProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
}

const Badges = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: BadgesProps<M, T>) => (
  <div {...props} className={clsx("flex flex-wrap gap-y-[4px] gap-x-[8px]", props.className)}>
    <TimePeriodTag
      size="xs"
      timePeriod={
        model.$kind === "experience"
          ? { startDate: model.startDate, endDate: model.endDate }
          : { startDate: model.startDate, endDate: model.endDate, postPoned: model.postPoned }
      }
    />
    <LocationTag
      size="xs"
      location={
        model.$kind === "education"
          ? {
              city: model.school.city,
              state: model.school.state,
            }
          : {
              city: model.company.city,
              state: model.company.state,
              isRemote: model.isRemote,
            }
      }
    />
  </div>
);

const ImageSizes: { [key in ResumeModelTileSize]: number } = {
  small: 28,
  medium: 44,
  large: 72,
};

export interface ResumeModelTileHeaderProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly size?: ResumeModelTileSize;
  readonly model: M;
  readonly imageSize?: number;
  readonly showBadges?: boolean;
  readonly children: ReactNode;
  readonly alignment?: "inset" | "left-aligned";
}

export const ResumeModelTileHeader = <M extends BrandModel<T>, T extends ResumeBrand>({
  size,
  model,
  imageSize,
  showBadges = true,
  children,
  alignment = "inset",
  ...props
}: ResumeModelTileHeaderProps<M, T>) =>
  alignment === "inset" || showBadges === false ? (
    <div {...props} className={clsx("flex flex-row gap-[12px] max-w-full w-full", props.className)}>
      <ResumeModelImage
        model={model}
        size={imageSize !== undefined ? imageSize : size !== undefined ? ImageSizes[size] : 28}
      />
      <div className="flex flex-col grow gap-[8px]">
        <div className={clsx("flex flex-col gap-[4px]", { "pt-[4px]": size === "large" })}>
          {children}
        </div>
        <ShowHide show={showBadges}>
          <Badges model={model} />
        </ShowHide>
      </div>
    </div>
  ) : (
    <div {...props} className={clsx("flex flex-col gap-[16px] max-w-full w-full", props.className)}>
      <ResumeModelTileHeader
        size={size}
        model={model}
        imageSize={imageSize}
        showBadges={false}
        alignment="inset"
      >
        {children}
      </ResumeModelTileHeader>
      <Badges model={model} />
    </div>
  );

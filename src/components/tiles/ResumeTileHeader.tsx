import clsx from "clsx";

import { type BrandModel, type ResumeBrand, getDegree } from "~/prisma/model";
import { ResumeModelImage } from "~/components/images/ResumeModelImage";
import { LocationTag } from "~/components/tags/LocationTag";
import { TimePeriodTag } from "~/components/tags/TimePeriodTag";
import { type ComponentProps } from "~/components/types";
import type { FontSize, FontWeight } from "~/components/typography";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";
import { ShowHide } from "~/components/util";

type HeaderSize = "small" | "large";

const ImageSizes: { [key in HeaderSize]: number } = {
  small: 28,
  large: 72,
};

const LinkFontWeights: { [key in HeaderSize]: FontWeight } = {
  small: "regular",
  large: "medium",
};

const LinkFontSizes: { [key in HeaderSize]: FontSize } = {
  small: "sm",
  large: "md",
};

export interface ResumeTileHeaderProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly size: HeaderSize;
  readonly model: M;
}

export const ResumeTileHeader = <M extends BrandModel<T>, T extends ResumeBrand>({
  size,
  model,
  ...props
}: ResumeTileHeaderProps<M, T>) => (
  <div {...props} className={clsx("flex flex-row gap-[12px] max-w-full w-full", props.className)}>
    <ResumeModelImage model={model} size={ImageSizes[size]} />
    <div className="flex flex-col gap-[8px]">
      <div className={clsx("flex flex-col gap-[4px]", { "pt-[4px]": size === "large" })}>
        {size === "large" ? (
          <Title order={2}>
            {model.kind === "experience"
              ? model.title
              : `${getDegree(model.degree).shortLabel} in ${model.major}`}
          </Title>
        ) : (
          <Text size="md" fontWeight="medium">
            {model.kind === "experience"
              ? model.title
              : `${getDegree(model.degree).shortLabel} in ${model.major}`}
          </Text>
        )}
        <LinkOrText
          fontWeight={LinkFontWeights[size]}
          fontSize={LinkFontSizes[size]}
          url={model.kind === "experience" ? model.company.websiteUrl : model.school.websiteUrl}
        >
          {model.kind === "experience" ? model.company.name : model.school.name}
        </LinkOrText>
      </div>
      <ShowHide show={size === "large"}>
        <div className="flex flex-wrap gap-y-[4px] gap-x-[8px]">
          <TimePeriodTag
            size="sm"
            timePeriod={
              model.kind === "experience"
                ? { startDate: model.startDate, endDate: model.endDate }
                : { startDate: model.startDate, endDate: model.endDate, postPoned: model.postPoned }
            }
          />
          <LocationTag
            size="sm"
            location={
              model.kind === "education"
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
      </ShowHide>
    </div>
  </div>
);

import clsx from "clsx";

import type { ResumeModelSize } from "./types";

import { type BrandModel, type ResumeBrand } from "~/prisma/model";

import { type ComponentProps } from "~/components/types";
import { type FontWeight } from "~/components/types/typography";
import { LinkOrText } from "~/components/typography/LinkOrText";

const LinkFontWeights: { [key in ResumeModelSize]: FontWeight } = {
  small: "regular",
  medium: "medium",
  large: "medium",
};

const TextClassNames: { [key in ResumeModelSize]: string } = {
  small: "text-description",
  medium: "text-description",
  large: "",
};

export interface ResumeModelSubTitleProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly size: ResumeModelSize;
  readonly textClassName?: ComponentProps["className"];
  readonly fontWeight?: FontWeight;
}

export const ResumeModelSubTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  fontWeight,
  textClassName,
  ...props
}: ResumeModelSubTitleProps<M, T>) => (
  <LinkOrText
    {...props}
    className={clsx(
      {
        small: "text-sm",
        medium: "text-smplus",
        large: "text-smplus max-sm:text-sm",
      }[size],
    )}
    fontWeight={
      fontWeight !== undefined ? fontWeight : size !== undefined ? LinkFontWeights[size] : "medium"
    }
    textClassName={
      textClassName !== undefined ? textClassName : size !== undefined ? TextClassNames[size] : ""
    }
    url={model.$kind === "experience" ? model.company.websiteUrl : model.school.websiteUrl}
  >
    {model.$kind === "experience" ? model.company.name : model.school.name}
  </LinkOrText>
);

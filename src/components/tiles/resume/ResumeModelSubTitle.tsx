import type { ResumeModelSize } from "./types";

import { type BrandModel, type ResumeBrand } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";
import { type FontSize, type FontWeight } from "~/components/typography";
import { LinkOrText } from "~/components/typography/LinkOrText";

const LinkFontWeights: { [key in ResumeModelSize]: FontWeight } = {
  small: "regular",
  medium: "medium",
  large: "medium",
};

const LinkFontSizes: { [key in ResumeModelSize]: FontSize } = {
  small: "sm",
  medium: "smplus",
  large: "md",
};

const TextClassNames: { [key in ResumeModelSize]: string } = {
  small: "text-body-light",
  medium: "text-body-light",
  large: "",
};

export interface ResumeModelSubTitleProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly size?: ResumeModelSize;
  readonly textClassName?: ComponentProps["className"];
  readonly fontWeight?: FontWeight;
  readonly fontSize?: FontSize;
}

export const ResumeModelSubTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  fontWeight,
  fontSize,
  textClassName,
  ...props
}: ResumeModelSubTitleProps<M, T>) => (
  <LinkOrText
    {...props}
    fontWeight={
      fontWeight !== undefined ? fontWeight : size !== undefined ? LinkFontWeights[size] : "medium"
    }
    fontSize={fontSize !== undefined ? fontSize : size !== undefined ? LinkFontSizes[size] : "md"}
    textClassName={
      textClassName !== undefined ? textClassName : size !== undefined ? TextClassNames[size] : ""
    }
    url={model.$kind === "experience" ? model.company.websiteUrl : model.school.websiteUrl}
  >
    {model.$kind === "experience" ? model.company.name : model.school.name}
  </LinkOrText>
);

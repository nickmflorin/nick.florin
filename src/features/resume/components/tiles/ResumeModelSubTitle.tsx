import { type BrandModel, type ResumeBrand } from "~/database/model";

import { classNames } from "~/components/types";
import { type ComponentProps, type FontWeight } from "~/components/types";
import { LinkOrText } from "~/components/typography/LinkOrText";
import type { ResumeModelSize } from "~/features/resume/types";

const LinkFontWeights: { [key in ResumeModelSize]: FontWeight } = {
  small: "regular",
  medium: "medium",
  large: "medium",
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
    className={classNames(
      {
        small: "text-sm",
        medium: "text-smplus",
        large: "text-smplus max-sm:text-sm",
      }[size],
      props.className,
    )}
    fontWeight={
      fontWeight !== undefined ? fontWeight : size !== undefined ? LinkFontWeights[size] : "medium"
    }
    textClassName={textClassName}
    url={model.$kind === "experience" ? model.company.websiteUrl : model.school.websiteUrl}
  >
    {model.$kind === "experience" ? model.company.name : model.school.name}
  </LinkOrText>
);

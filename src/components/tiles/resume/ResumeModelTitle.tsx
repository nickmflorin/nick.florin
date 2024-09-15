import type { ResumeModelSize } from "./types";

import { type BrandModel, type ResumeBrand, getDegree } from "~/prisma/model";

import { ExpandResumeModelButton } from "~/components/buttons/resume";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Text, Title } from "~/components/typography";
import { ShowHide } from "~/components/util";

const Titles: {
  [key in ResumeModelSize]: ({ children }: { children: string }) => JSX.Element;
} = {
  small: ({ children }) => (
    <Text
      fontSize="md"
      fontWeight="medium"
      className="leading-[22px] max-sm:text-smplus max-sm:leading-[22px]"
    >
      {children}
    </Text>
  ),
  medium: ({ children }) => (
    <Title component="h3" className="leading-[22px] max-sm:text-title-sm max-sm:leading-[22px]">
      {children}
    </Title>
  ),
  large: ({ children }) => (
    <Title
      component="h2"
      className={classNames(
        "leading-[22px] text-title-md",
        "max-md:leading-[22px] max-md:text-title-smplus",
        "max-sm:text-title-sm max-sm:leading-[22px]",
      )}
    >
      {children}
    </Title>
  ),
};

export interface ResumeModelTitleProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly expandable?: boolean;
  readonly size: ResumeModelSize;
}

export const ResumeModelTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  expandable = false,
  ...props
}: ResumeModelTitleProps<M, T>) => {
  const TitleComponent = Titles[size];
  return (
    <div
      {...props}
      className={classNames(
        "flex flex-row justify-between items-center w-full gap-[8px]",
        props.className,
      )}
    >
      <TitleComponent>
        {model.$kind === "experience"
          ? model.title
          : `${getDegree(model.degree).shortLabel} in ${model.major}`}
      </TitleComponent>
      <ShowHide show={expandable}>
        <ExpandResumeModelButton
          tourId="expand-button"
          modelType={model.$kind}
          modelId={model.id}
        />
      </ShowHide>
    </div>
  );
};

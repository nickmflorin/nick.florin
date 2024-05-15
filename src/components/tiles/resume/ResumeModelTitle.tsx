import clsx from "clsx";

import type { ResumeModelSize } from "./types";

import { type BrandModel, type ResumeBrand, getDegree } from "~/prisma/model";
import { ExpandResumeModelButton } from "~/components/buttons/resume";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";
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
    <Title order={3} className="leading-[22px] max-sm:text-title_sm max-sm:leading-[22px]">
      {children}
    </Title>
  ),
  large: ({ children }) => (
    <Title
      order={2}
      className={clsx(
        "leading-[22px] text-title_md",
        "max-md:leading-[22px] max-md:text-title_smplus",
        "max-sm:text-title_sm max-sm:leading-[22px]",
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
  readonly pushOnExpand?: boolean;
  readonly size: ResumeModelSize;
}

export const ResumeModelTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  expandable = false,
  pushOnExpand = false,
  ...props
}: ResumeModelTitleProps<M, T>) => {
  const TitleComponent = Titles[size];
  return (
    <div
      {...props}
      className={clsx(
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
          push={pushOnExpand}
        />
      </ShowHide>
    </div>
  );
};

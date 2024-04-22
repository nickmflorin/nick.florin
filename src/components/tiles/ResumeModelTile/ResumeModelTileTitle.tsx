import clsx from "clsx";

import type { ResumeModelTileSize } from "./types";

import { type BrandModel, type ResumeBrand, getDegree } from "~/prisma/model";
import { ExpandResumeModelButton } from "~/components/buttons/ExpandResumeModelButton";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";
import { ShowHide } from "~/components/util";

const Titles: {
  [key in ResumeModelTileSize]: ({ children }: { children: string }) => JSX.Element;
} = {
  small: ({ children }) => (
    <Text size="md" fontWeight="medium" className="leading-[22px]">
      {children}
    </Text>
  ),
  medium: ({ children }) => <Title order={3}>{children}</Title>,
  large: ({ children }) => <Title order={2}>{children}</Title>,
};

export interface ResumeModelTileTitleProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
  readonly expandable?: boolean;
  readonly size: ResumeModelTileSize;
}

export const ResumeModelTileTitle = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  size,
  expandable = false,
  ...props
}: ResumeModelTileTitleProps<M, T>) => {
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
        <ExpandResumeModelButton modelType={model.$kind} modelId={model.id} />
      </ShowHide>
    </div>
  );
};

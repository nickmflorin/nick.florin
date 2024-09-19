"use client";
import { type ResumeBrand } from "~/database/model";

import { IconButton } from "~/components/buttons";
import { type DrawerId, DrawerIds, type DrawerIdPropsPair } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { classNames } from "~/components/types";

type ModelDrawerId = Extract<
  DrawerId,
  typeof DrawerIds.VIEW_EXPERIENCE | typeof DrawerIds.VIEW_EDUCATION
>;

const ModelDrawerIds: {
  [key in ResumeBrand]: ModelDrawerId;
} = {
  education: DrawerIds.VIEW_EDUCATION,
  experience: DrawerIds.VIEW_EXPERIENCE,
};

export const ModelDrawerProps: {
  [key in ResumeBrand]: (modelId: string) => DrawerIdPropsPair<(typeof ModelDrawerIds)[key]>;
} = {
  education: modelId => ({
    id: DrawerIds.VIEW_EDUCATION,
    props: { educationId: modelId },
  }),
  experience: modelId => ({
    id: DrawerIds.VIEW_EXPERIENCE,
    props: { experienceId: modelId },
  }),
};

export interface ExpandResumeModelButtonProps<T extends ResumeBrand> {
  readonly modelId: string;
  readonly modelType: T;
  readonly tourId?: string;
}

export const ExpandResumeModelButton = <T extends ResumeBrand>({
  modelId,
  modelType,
  tourId,
}: ExpandResumeModelButtonProps<T>) => {
  const { open } = useDrawers();

  return (
    <IconButton.Transparent
      size="small"
      tourId={tourId}
      icon={{ name: "up-right-and-down-left-from-center", iconStyle: "solid" }}
      className={classNames(
        "rounded-full text-gray-500 hover:text-gray-600",
        "min-h-[22px] h-[22px] w-[22px]",
      )}
      iconSize="14px"
      onClick={() =>
        open(ModelDrawerProps[modelType](modelId).id, ModelDrawerProps[modelType](modelId).props)
      }
    />
  );
};

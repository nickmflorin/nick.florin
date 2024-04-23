"use client";
import clsx from "clsx";

import { type ResumeBrand } from "~/prisma/model";
import { IconButton } from "~/components/buttons";
import { ViewResumeModelDrawer } from "~/components/drawers/details/ResumeModelDetailDrawer";

export interface ExpandResumeModelButtonProps<T extends ResumeBrand> {
  readonly modelId: string;
  readonly modelType: T;
}

export const ExpandResumeModelButton = <T extends ResumeBrand>({
  modelId,
  modelType,
}: ExpandResumeModelButtonProps<T>) => (
  <ViewResumeModelDrawer modelId={modelId} modelType={modelType}>
    {({ isLoading, open }) => (
      <IconButton.Transparent
        size="small"
        isLoading={isLoading}
        icon={{ name: "up-right-and-down-left-from-center", iconStyle: "solid" }}
        className={clsx(
          "rounded-full text-gray-500 hover:text-gray-600",
          "min-h-[22px] h-[22px] w-[22px]",
        )}
        onClick={() => open()}
      />
    )}
  </ViewResumeModelDrawer>
);

"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import clsx from "clsx";

import type { BrandEducation, BrandExperience } from "~/prisma/model";
import { IconButton } from "~/components/buttons";
import { type DrawerId, DrawerIds, type DrawerIdPropsPair } from "~/components/drawers";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

type ModelType = BrandExperience["$kind"] | BrandEducation["$kind"];

type ModelDrawerId = Extract<
  DrawerId,
  typeof DrawerIds.VIEW_EXPERIENCE | typeof DrawerIds.VIEW_EDUCATION
>;

const ModelDrawerIds: {
  [key in ModelType]: ModelDrawerId;
} = {
  education: DrawerIds.VIEW_EDUCATION,
  experience: DrawerIds.VIEW_EXPERIENCE,
};

const ModelDrawerProps: {
  [key in ModelType]: (modelId: string) => DrawerIdPropsPair<(typeof ModelDrawerIds)[key]>;
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

export interface ExpandResumeModelButtonProps<T extends ModelType> {
  readonly modelId: string;
  readonly modelType: T;
}

export const ExpandResumeModelButton = <T extends ModelType>({
  modelId,
  modelType,
}: ExpandResumeModelButtonProps<T>) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <IconButton.Transparent
            size="small"
            isLoading={isLoading}
            icon={{ name: "up-right-and-down-left-from-center", iconStyle: "solid" }}
            className={clsx(
              "rounded-full text-gray-500 hover:text-gray-600",
              "min-h-[22px] h-[22px] w-[22px]",
            )}
            onClick={() => setDrawerOpen(true)}
          />
          {drawerOpen && (
            <ClientDrawer
              id={ModelDrawerProps[modelType](modelId).id}
              props={ModelDrawerProps[modelType](modelId).props}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </>
      )}
    </DynamicLoading>
  );
};

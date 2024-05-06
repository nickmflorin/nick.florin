import dynamic from "next/dynamic";
import { useState } from "react";

import { type ResumeBrand } from "~/prisma/model";
import { type DrawerId, DrawerIds, type DrawerIdPropsPair } from "~/components/drawers";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

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

export interface ResumeModelDetailDrawerProps<T extends ResumeBrand> {
  readonly modelId: string;
  readonly modelType: T;
  readonly push?: boolean;
  readonly children: (params: { isLoading: boolean; open: () => void }) => JSX.Element;
}

export const ViewResumeModelDrawer = <T extends ResumeBrand>({
  modelId,
  modelType,
  push = false,
  children,
}: ResumeModelDetailDrawerProps<T>) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <DynamicLoading>
        {({ isLoading }) => children({ isLoading, open: () => setDrawerOpen(true) })}
      </DynamicLoading>
      {drawerOpen && (
        <ClientDrawer
          id={ModelDrawerProps[modelType](modelId).id}
          props={ModelDrawerProps[modelType](modelId).props}
          onClose={() => setDrawerOpen(false)}
          push={push}
        />
      )}
    </>
  );
};

export default ViewResumeModelDrawer;

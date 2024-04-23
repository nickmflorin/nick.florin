"use client";
import { type ResumeBrand } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { ViewResumeModelDrawer } from "~/components/drawers/details/ResumeModelDetailDrawer";

export interface ResumeShowMoreLinkProps<T extends ResumeBrand> {
  readonly modelId: string;
  readonly modelType: T;
}

export const ResumeShowMoreLink = <T extends ResumeBrand>({
  modelId,
  modelType,
}: ResumeShowMoreLinkProps<T>) => (
  <ViewResumeModelDrawer modelId={modelId} modelType={modelType}>
    {({ isLoading, open }) => (
      <Link.Primary
        fontSize="xs"
        fontWeight="regular"
        options={{ as: "button" }}
        isLoading={isLoading}
        flex
        loadingLocation="over"
        onClick={() => open()}
      >
        Show more
      </Link.Primary>
    )}
  </ViewResumeModelDrawer>
);

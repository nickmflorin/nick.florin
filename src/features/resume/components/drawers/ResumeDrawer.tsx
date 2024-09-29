import { MIME_TYPES } from "@mantine/dropzone";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { ManagedResumeUploads } from "~/features/resume/components/ManagedResumeUploads";
import { useResumes } from "~/hooks/api";

export interface ResumeDrawerProps extends ExtendingDrawerProps {}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const ResumeDrawer = (props: ResumeDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useResumes({
    keepPreviousData: true,
    query: { visibility: "admin" },
  });

  return (
    <ContextDrawer>
      <ContextDrawer.Header className="pl-[18px] pt-[18px] pr-[18px]">Resumes</ContextDrawer.Header>
      <ContextDrawer.Content className="flex flex-col p-[18px] gap-[12px] overflow-y-hidden">
        <ManagedResumeUploads
          data={data ?? []}
          error={error}
          isLoading={isLoading}
          accept={[MIME_TYPES.pdf]}
        />
      </ContextDrawer.Content>
    </ContextDrawer>
  );
};

export default ResumeDrawer;

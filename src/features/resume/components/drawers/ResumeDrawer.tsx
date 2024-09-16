import { MIME_TYPES } from "@mantine/dropzone";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { Drawer } from "~/components/drawers/Drawer";
import { ManagedResumeUploads } from "~/features/resume/components/ManagedResumeUploads";
import { useResumes } from "~/hooks";

export interface ResumeDrawerProps extends ExtendingDrawerProps {}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const ResumeDrawer = (props: ResumeDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useResumes({ keepPreviousData: true, query: {} });

  return (
    <Drawer>
      <Drawer.Header className="pl-[18px] pt-[18px] pr-[18px]">Resumes</Drawer.Header>
      <Drawer.Content className="flex flex-col p-[18px] gap-[12px] overflow-y-hidden">
        <ManagedResumeUploads
          data={data ?? []}
          error={error}
          isLoading={isLoading}
          accept={[MIME_TYPES.pdf]}
        />
      </Drawer.Content>
    </Drawer>
  );
};

export default ResumeDrawer;

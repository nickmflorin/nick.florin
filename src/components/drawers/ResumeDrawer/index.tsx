import { MIME_TYPES } from "@mantine/dropzone";

import { Drawer } from "~/components/drawers/Drawer";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { DrawerHeader } from "~/components/drawers/DrawerHeader";
import { ManagedResumeUploads } from "~/components/uploads/ManagedResumeUploads";
import { useResumes } from "~/hooks";

export const ResumeDrawer = (): JSX.Element => {
  const { data, isLoading, error } = useResumes({ keepPreviousData: true });

  return (
    <Drawer>
      <DrawerHeader className="pl-[18px] pt-[18px] pr-[18px]">Resumes</DrawerHeader>
      <DrawerContent className="flex flex-col p-[18px] gap-[12px] overflow-y-hidden">
        <ManagedResumeUploads
          data={data ?? []}
          error={error}
          isLoading={isLoading}
          accept={[MIME_TYPES.pdf]}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ResumeDrawer;

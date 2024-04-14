import clsx from "clsx";

import { uploadResume } from "~/actions/mutations/resumes";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Resumes } from "~/components/tiles/Resumes";
import { type ComponentProps } from "~/components/types";
// TODO: Consider lazy loading, due to Mantine package import.
import { ResumeUploader } from "~/components/uploads/ResumeUploader";
import { useResumes } from "~/hooks";

const upload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return await uploadResume(formData);
};

export interface ResumeDrawerContentProps extends ComponentProps {}

export const ResumeDrawerContent = (props: ResumeDrawerContentProps) => {
  const { data, isLoading, error } = useResumes({ keepPreviousData: true });
  return (
    <DrawerContent
      {...props}
      className={clsx("flex flex-col p-[12px] gap-[12px]", props.className)}
    >
      <div className="relative flex flex-col grow max-h-full">
        <ApiResponseState error={error} isLoading={isLoading} data={data}>
          {resumes => <Resumes className="h-full" resumes={resumes} />}
        </ApiResponseState>
      </div>
      <ResumeUploader
        onUpload={async (files, instance) => {
          instance.setIsLoading(true);
          const resumes = await Promise.all(files.map(upload));
          instance.setIsLoading(false);
        }}
      />
    </DrawerContent>
  );
};

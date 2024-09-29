import type { BrandResume } from "~/database/model";

import { uploadResume } from "~/actions/resumes/upload-resume";

import { ManagedUploads, type ManagedUploadsProps } from "~/components/uploads/ManagedUploads";

import { UploadResumeTile } from "./UploadResumeTile";

export interface ManagedResumeUploadsProps
  extends Omit<ManagedUploadsProps<BrandResume>, "uploadAction"> {}

export const ManagedResumeUploads = (props: ManagedResumeUploadsProps) => (
  <ManagedUploads {...props} uploadAction={async formData => await uploadResume(formData)}>
    {({ manager, upload }) => <UploadResumeTile manager={manager} upload={upload} />}
  </ManagedUploads>
);

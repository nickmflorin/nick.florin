import type { BrandResume } from "~/prisma/model";

import { uploadResume } from "~/actions/mutations/resumes";

import { ManagedUploads, type ManagedUploadsProps } from "../ManagedUploads";

import { UploadResumeTile } from "./UploadResumeTile";

export interface ManagedResumeUploadsProps
  extends Omit<ManagedUploadsProps<BrandResume>, "uploadAction"> {}

export const ManagedResumeUploads = (props: ManagedResumeUploadsProps) => (
  <ManagedUploads {...props} uploadAction={async formData => await uploadResume(formData)}>
    {({ manager, upload }) => <UploadResumeTile manager={manager} upload={upload} />}
  </ManagedUploads>
);

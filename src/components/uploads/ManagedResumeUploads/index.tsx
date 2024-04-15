import type { ApiResume } from "~/prisma/model";
import { uploadResume } from "~/actions/mutations/resumes";
import { isApiClientGlobalErrorJson } from "~/api";

import { ManagedUploads, type ManagedUploadsProps } from "../ManagedUploads";

import { UploadResumeTile } from "./UploadResumeTile";

export interface ManagedResumeUploadsProps
  extends Omit<ManagedUploadsProps<ApiResume<["primary"]>>, "uploadAction"> {}

export const ManagedResumeUploads = (props: ManagedResumeUploadsProps) => (
  <ManagedUploads
    {...props}
    uploadAction={async (formData, manager) => {
      const response = await uploadResume(formData);
      if (isApiClientGlobalErrorJson(response)) {
        return response;
      }
      /* We have to sync all of the resumes after the upload completes because the upload may
         have changed the primary resume designation. */
      manager.sync(response.resumes);
      return response.resume;
    }}
  >
    {({ manager, upload }) => <UploadResumeTile manager={manager} upload={upload} />}
  </ManagedUploads>
);

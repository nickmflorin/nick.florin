import { type DropzoneProps } from "@mantine/dropzone";
import { type FileRejection, type FileError, type FileWithPath } from "react-dropzone-esm";

import type { ApiClientGlobalErrorJson } from "~/api";
import { type ComponentProps } from "~/components/types";

export type BaseUploadModel = {
  readonly id: string;
  readonly size: number | bigint;
  readonly createdAt: Date;
  readonly filename: string;
};

export type UploadId = `upload-${string}`;

export type UploadState = "failed" | "uploading" | "uploaded" | "existing" | "rejected";

/* Represents an upload that is currently in progress and has not yet been persisted to the database
   or loaded via an API request. */
export type InProgressUpload = { file: FileWithPath; uploadId: UploadId; state: "uploading" };
/* Represents an upload that has just finished uploading, has an existing database model but has
   not yet been loaded via the API.  This model is nearly identical to the 'ExistingUpload' model,
   and will (at most times) be used interchangeably.  The only reason they are different is so we
   can tell the difference between uploads that have been optimistically updated via state and
   uploads that have been loaded via an API request. */
export type FinishedUpload<M extends BaseUploadModel> = {
  file: FileWithPath;
  uploadId: UploadId;
  model: M;
  state: "uploaded";
};

export type FailedUpload = {
  file: FileWithPath;
  state: "failed";
  errors: string[];
  uploadId: UploadId;
};

export type RejectedUpload = {
  file: FileRejection["file"];
  errors: FileError[];
  state: "rejected";
  uploadId: UploadId;
};

// Represents an upload that already exists in the database and has been loaded via the API.
export type ExistingUpload<M extends BaseUploadModel> = { model: M; state: "existing" };

export type UploadStates<M extends BaseUploadModel> = {
  failed: FailedUpload;
  uploaded: FinishedUpload<M>;
  existing: ExistingUpload<M>;
  uploading: InProgressUpload;
  rejected: RejectedUpload;
};

export type Upload<
  M extends BaseUploadModel,
  S extends UploadState = UploadState,
> = S extends UploadState ? UploadStates<M>[S] : never;

export const isUploadOfState = <M extends BaseUploadModel, S extends UploadState>(
  upload: Upload<M>,
  states: S[],
): upload is Upload<M, S> => states.includes(upload.state as S);

export type UploadsManager<M extends BaseUploadModel> = {
  readonly uploads: Upload<M>[];
  readonly isUploading: boolean;
  readonly dismissFailedUpload: (id: UploadId) => void;
  readonly dismissRejectedUpload: (id: UploadId) => void;
  readonly performUpload: (files: FileWithPath[]) => void;
  readonly removeUpload: (id: string) => void;
  readonly setIsUploading: (v: boolean) => void;
  /**
   * Syncs the upload state with data supplied from an external source, such as an API request.
   *
   * If the 'prependNew' option is set to false, explicitly, then new uploads will not be added to
   * the beginning of the uploads state - only uploads already in the uploads state will be updated.
   */
  readonly sync: (data: M[], options?: { prependNew?: boolean }) => void;
  readonly addRejectedFiles: (files: FileRejection[]) => void;
};

export type UploadAction<M extends BaseUploadModel> = (
  formData: FormData,
  manager: Pick<UploadsManager<M>, "sync">,
) => Promise<M | ApiClientGlobalErrorJson>;

export interface UploadDropzoneProps
  extends Pick<DropzoneProps, "onDrop" | "onReject" | "accept" | "multiple">,
    ComponentProps {
  readonly maxUploadSize?: number;
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
}

export interface UploaderProps<M extends BaseUploadModel>
  extends Omit<UploadDropzoneProps, "onReject" | "onDrop"> {
  readonly dropzoneClassName?: ComponentProps["className"];
  readonly manager: UploadsManager<M>;
  readonly isDisabled?: boolean;
}

export type UploaderComponent = {
  <M extends BaseUploadModel>(props: UploaderProps<M>): JSX.Element;
};

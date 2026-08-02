import { type JSX } from 'react';

import { type DropzoneProps } from '@mantine/dropzone';
import { type FileError, type FileRejection, type FileWithPath } from 'react-dropzone-esm';

import { type MutationActionResponse } from '~/actions';

import { type ComponentProps } from '~/components/types';

export type BaseUploadModel = {
  readonly createdAt: Date;
  readonly downloadUrl: string;
  readonly filename: string;
  readonly id: string;
  readonly size: bigint | number;
  readonly url: string;
};

export type UploadId = `upload-${string}`;

export type UploadState = 'existing' | 'failed' | 'rejected' | 'uploaded' | 'uploading';

/**
 * Represents an upload that is currently in progress and has not yet been persisted to the
 * database or loaded via an API request.
 */
export type InProgressUpload = { file: FileWithPath; state: 'uploading'; uploadId: UploadId };

/**
 * Represents an upload that has just finished uploading and has an existing database model, but
 * has not yet been loaded via the API.
 *
 * This model is nearly identical to {@link ExistingUpload}, and will, at most times, be used
 * interchangeably. The only reason they differ is to distinguish uploads that have been
 * optimistically updated via state from uploads that have been loaded via an API request.
 */
export type FinishedUpload<M extends BaseUploadModel> = {
  file: FileWithPath;
  model: M;
  state: 'uploaded';
  uploadId: UploadId;
};

export type FailedUpload = {
  errors: string[];
  file: FileWithPath;
  state: 'failed';
  uploadId: UploadId;
};

export type RejectedUpload = {
  errors: FileError[];
  file: FileRejection['file'];
  state: 'rejected';
  uploadId: UploadId;
};

/**
 * Represents an upload that already exists in the database and has been loaded via the API.
 */
export type ExistingUpload<M extends BaseUploadModel> = { model: M; state: 'existing' };

export type UploadStates<M extends BaseUploadModel> = {
  existing: ExistingUpload<M>;
  failed: FailedUpload;
  rejected: RejectedUpload;
  uploaded: FinishedUpload<M>;
  uploading: InProgressUpload;
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
  readonly addRejectedFiles: (files: FileRejection[]) => void;
  readonly dismissFailedUpload: (id: UploadId) => void;
  readonly dismissRejectedUpload: (id: UploadId) => void;
  readonly isUploading: boolean;
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
  readonly uploads: Upload<M>[];
};

export type UploadAction<M extends BaseUploadModel> = (
  formData: FormData,
  manager: Pick<UploadsManager<M>, 'sync'>,
) => Promise<MutationActionResponse<M>>;

export interface UploadDropzoneProps
  extends Pick<DropzoneProps, 'accept' | 'multiple' | 'onDrop' | 'onReject'>, ComponentProps {
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly maxUploadSize?: number;
}

export interface UploaderProps<M extends BaseUploadModel> extends Omit<
  UploadDropzoneProps,
  'onDrop' | 'onReject'
> {
  readonly dropzoneClassName?: ComponentProps['className'];
  readonly isDisabled?: boolean;
  readonly manager: UploadsManager<M>;
}

export type UploaderComponent = <M extends BaseUploadModel>(props: UploaderProps<M>) => JSX.Element;

import { useCallback, useState } from 'react';

import {
  type ErrorCode,
  type FileError,
  type FileRejection,
  type FileWithPath,
} from 'react-dropzone-esm';
import { v4 as uuid } from 'uuid';

import { logger } from '~/internal/logger';

import * as types from '../types';

const createUploadId = (): types.UploadId => `upload-${uuid()}`;

const REJECTED_FILE_ERROR_MESSAGES: Record<ErrorCode, string> = {
  'file-invalid-type': 'The file type is not supported.',
  'file-too-large': 'The file is too large.',
  'file-too-small': 'The file is too small.',
  'too-many-files': 'Too many files were uploaded.',
};

const isRejectedFileErrorCode = (code: string): code is ErrorCode =>
  Object.keys(REJECTED_FILE_ERROR_MESSAGES).includes(code);

const stringifyFileError = (error: FileError, index: number): string =>
  `${index + 1}. ${error.message} (code = ${error.code})`;

export const getRejectedFileErrors = (rej: FileRejection): FileError[] => {
  if (rej.errors.length !== 0) {
    const humanized = rej.errors.map(stringifyFileError).join('\n');
    logger.info(`File was rejected with the following errors:\n${humanized}`, {
      errors: rej.errors,
      file: rej.file,
    });
    return rej.errors.map(e => {
      if (isRejectedFileErrorCode(e.code)) {
        return { code: e.code, message: REJECTED_FILE_ERROR_MESSAGES[e.code] };
      }
      return e;
    });
  }
  logger.error('Dropzone unexpectedly rejected a file and did not provide any error messages.');
  return [];
};

interface UseUploadsConfig<M extends types.BaseUploadModel> {
  readonly initialData?: M[];
  readonly manageResponse?: boolean;
  readonly uploadAction: types.UploadAction<M>;
}

/**
 * Reconciles a single existing or uploaded {@link types.Upload} with the freshly synced `data`,
 * returning `null` if the upload should be removed from state.
 *
 * If the upload is in the "existing" state, and there is a corresponding model in the new data,
 * its model attribute is simply updated in place. If there is no corresponding model in the data,
 * the upload is removed, since it was deleted.
 *
 * If the upload is in the "uploaded" state, and there is a corresponding model in the new data, the
 * upload is converted from "uploaded" to "existing", with the new model. If there is no
 * corresponding model in the data, the upload is removed, since it should have a corresponding
 * model if it in fact completed uploading with the server.
 *
 * An upload that is in neither the "existing" nor "uploaded" state is left in state unchanged.
 */
const reconcileUploadWithData = <M extends types.BaseUploadModel>(
  upload: types.Upload<M>,
  data: M[],
): null | types.Upload<M> => {
  if (types.isUploadOfState(upload, ['existing', 'uploaded'])) {
    const existing = data.find(m => m.id === upload.model.id);
    if (existing) {
      return { model: existing, state: 'existing' };
    }
    return null;
  }
  return upload;
};

export const useManagedUploads = <M extends types.BaseUploadModel>({
  initialData,
  uploadAction,
}: UseUploadsConfig<M>): types.UploadsManager<M> => {
  const [isUploading, setIsUploading] = useState(false);

  const [uploads, setUploads] = useState<types.Upload<M>[]>(
    initialData ? initialData.map(m => ({ model: m, state: 'existing' })) : [],
  );

  const modifyUpload = useCallback(
    (
      uploadId: types.UploadId,
      modification: Pick<types.FailedUpload, 'errors'> | Pick<types.FinishedUpload<M>, 'model'>,
    ) => {
      const update =
        'errors' in modification
          ? { error: modification.errors, state: 'failed' }
          : { model: modification.model, state: 'uploaded' };

      setUploads((curr): types.Upload<M>[] => {
        const index = curr.findIndex(
          upload => upload.state === 'uploading' && upload.uploadId === uploadId,
        );
        if (index === -1) {
          logger.error(
            `Could not modify upload with upload ID '${uploadId}' because an upload with state ` +
              "'uploading' with that ID could not be found in state!",
            { modification, uploadId },
          );
          return curr;
        }
        const upload = curr[index] as types.InProgressUpload;
        return [
          ...curr.slice(0, index),
          { ...upload, ...update } as types.FailedUpload | types.FinishedUpload<M>,
          ...curr.slice(index + 1),
        ];
      });
    },
    [],
  );

  const dismissFailedUpload = useCallback((id: types.UploadId) => {
    setUploads((curr): types.Upload<M>[] =>
      curr.filter(upload => upload.state !== 'failed' || upload.uploadId !== id),
    );
  }, []);

  const dismissRejectedUpload = useCallback((id: types.UploadId) => {
    setUploads((curr): types.Upload<M>[] =>
      curr.filter(upload => upload.state !== 'rejected' || upload.uploadId !== id),
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((curr): types.Upload<M>[] =>
      curr.filter(
        upload =>
          !types.isUploadOfState(upload, ['existing', 'uploaded']) || upload.model.id !== id,
      ),
    );
  }, []);

  const sync = useCallback((data: M[], options?: { prependNew?: boolean }) => {
    setUploads(curr => {
      const prependNew = options?.prependNew ?? true;

      /* Models that are not already represented in the set of uploads as either an existing upload
         or an uploaded upload. */
      const newModels = prependNew
        ? data.filter(
            (model: M): boolean =>
              !curr.some(
                upload =>
                  types.isUploadOfState(upload, ['existing', 'uploaded']) &&
                  upload.model.id === model.id,
              ),
          )
        : [];
      return [
        /* Prepend new models to the state as existing uploads.  We prepend to the beginning because
           the default ordering is by the created at date of the upload, with newer uploads
           appearing first. */
        ...newModels.map((model): types.ExistingUpload<M> => ({ model, state: 'existing' })),
        ...curr.reduce((prev: types.Upload<M>[], upload: types.Upload<M>): types.Upload<M>[] => {
          const reconciled = reconcileUploadWithData(upload, data);
          return reconciled ? [...prev, reconciled] : prev;
        }, []),
      ];
    });
  }, []);

  const addRejectedFiles = useCallback((files: FileRejection[]) => {
    setUploads(curr => [
      ...files.map(f => {
        const uploadId = createUploadId();
        return {
          errors: getRejectedFileErrors(f),
          file: f.file,
          state: 'rejected' as const,
          uploadId,
        };
      }),
      ...curr,
    ]);
  }, []);

  const uploadFile = useCallback(
    async (file: FileWithPath) => {
      const uploadId = createUploadId();
      setUploads(curr => [{ file, state: 'uploading', uploadId }, ...curr]);

      const formData = new FormData();
      formData.append('file', file);

      let response: Awaited<ReturnType<typeof uploadAction>> | null = null;
      try {
        response = await uploadAction(formData, { sync });
      } catch (e) {
        logger.errorUnsafe(e, `There was a server error while uploading file ${file.name}.`, {
          file,
        });
        return modifyUpload(uploadId, { errors: ['There was an error uploading the file.'] });
      }
      const { data, error } = response;
      if (error) {
        logger.error(error, `There was a client error while uploading file ${file.name}.`, {
          file,
        });
        return modifyUpload(uploadId, { errors: [error.message] });
      }
      logger.info(`File ${file.name} successfully uploaded, adding file to finished uploads...`, {
        file,
        uploadId,
      });
      return modifyUpload(uploadId, { model: data });
    },
    [uploadAction, modifyUpload, sync],
  );

  const performUploads = useCallback(
    async (files: FileWithPath[]) => {
      setIsUploading(true);
      await Promise.all(files.map(f => uploadFile(f)));
      setIsUploading(false);
    },
    [uploadFile],
  );

  const performUpload = useCallback(
    (files: FileWithPath[]) => {
      performUploads(files).catch(e => {
        logger.errorUnsafe(e, 'There was an error performing the file uploads.', { files });
        setIsUploading(false);
      });
    },
    [performUploads],
  );

  return {
    addRejectedFiles,
    dismissFailedUpload,
    dismissRejectedUpload,
    isUploading,
    performUpload,
    removeUpload,
    setIsUploading,
    sync,
    uploads,
  };
};

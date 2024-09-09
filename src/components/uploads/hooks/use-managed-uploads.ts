import { useState, useCallback } from "react";

import { v4 as uuid } from "uuid";

import type { FileWithPath, FileRejection, ErrorCode, FileError } from "react-dropzone-esm";

import { logger } from "~/application/logger";

import { isApiClientGlobalErrorJson, type ApiClientGlobalErrorJson } from "~/api";

import * as types from "../types";

const createUploadId = (): types.UploadId => `upload-${uuid()}`;

const REJECTED_FILE_ERROR_MESSAGES: { [key in ErrorCode]: string } = {
  "file-invalid-type": "The file type is not supported.",
  "file-too-large": "The file is too large.",
  "file-too-small": "The file is too small.",
  "too-many-files": "Too many files were uploaded.",
};

const stringifyFileError = (error: FileError, index: number): string =>
  `${index + 1}. ${error.message} (code = ${error.code})`;

export const getRejectedFileErrors = (rej: FileRejection): FileError[] => {
  if (rej.errors.length !== 0) {
    const humanized = rej.errors.map(stringifyFileError).join("\n");
    logger.info(`File was rejected with the following errors:\n${humanized}`, {
      errors: rej.errors,
      file: rej.file,
    });
    return rej.errors.map(e => {
      if (REJECTED_FILE_ERROR_MESSAGES[e.code as ErrorCode] !== undefined) {
        return { message: REJECTED_FILE_ERROR_MESSAGES[e.code as ErrorCode], code: e.code };
      }
      return e;
    });
  }
  logger.error("Dropzone unexpectedly rejected a file and did not provide any error messages.");
  return [];
};

interface UseUploadsConfig<M extends types.BaseUploadModel> {
  readonly initialData?: M[];
  // Whether or not, by default, the manager should update the state of uploads based on
  readonly manageResponse?: boolean;
  readonly uploadAction: types.UploadAction<M>;
}

export const useManagedUploads = <M extends types.BaseUploadModel>({
  initialData,
  uploadAction,
}: UseUploadsConfig<M>): types.UploadsManager<M> => {
  const [isUploading, setIsUploading] = useState(false);

  const [uploads, setUploads] = useState<types.Upload<M>[]>(
    initialData ? initialData.map(m => ({ model: m, state: "existing" })) : [],
  );

  const modifyUpload = useCallback(
    (
      uploadId: types.UploadId,
      modification: Pick<types.FailedUpload, "errors"> | Pick<types.FinishedUpload<M>, "model">,
    ) => {
      const update =
        (modification as { errors: string[] }).errors !== undefined
          ? { state: "failed", error: (modification as { errors: string[] }).errors }
          : { state: "uploaded", model: (modification as { model: M }).model };

      setUploads((curr): types.Upload<M>[] => {
        const index = curr.findIndex(
          upload => upload.state === "uploading" && upload.uploadId === uploadId,
        );
        if (index === -1) {
          logger.error(
            `Could not modify upload with upload ID '${uploadId}' because an upload with state ` +
              "'uploading' with that ID could not be found in state!",
            { uploadId, modification },
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
      curr.filter(upload => upload.state !== "failed" || upload.uploadId !== id),
    );
  }, []);

  const dismissRejectedUpload = useCallback((id: types.UploadId) => {
    setUploads((curr): types.Upload<M>[] =>
      curr.filter(upload => upload.state !== "rejected" || upload.uploadId !== id),
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((curr): types.Upload<M>[] =>
      curr.filter(
        upload =>
          !types.isUploadOfState(upload, ["existing", "uploaded"]) || upload.model.id !== id,
      ),
    );
  }, []);

  /**
   * Syncs the data that is loaded from an external API request with the current tracked uploads
   * in state.
   */
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
                  types.isUploadOfState(upload, ["existing", "uploaded"]) &&
                  upload.model.id === model.id,
              ),
          )
        : [];
      return [
        /* Prepend new models to the state as existing uploads.  We prepend to the beginning because
           the default ordering is by the created at date of the upload, with newer uploads
           appearing first. */
        ...newModels.map((model): types.ExistingUpload<M> => ({ state: "existing", model })),
        ...curr.reduce((prev: types.Upload<M>[], upload: types.Upload<M>): types.Upload<M>[] => {
          /* If the upload is already in the existing state, and there is a corresponding model in
             the new data, simply update the existing upload's model attribute in state.  However,
             if there is NOT a corresponding model in the data, remove the upload from state - since
             it was deleted.

             If the upload is in the uploaded state, and there is a corresponding model in the new
             data, simply convert the uploaded state upload to an existing state upload, with the
             new model.  However, if there is NOT a corresponding model in the data, remove the
             upload from state - since it should have a corresponding model it if it fact had
             completed uploading with the server. */
          if (types.isUploadOfState(upload, ["existing", "uploaded"])) {
            const existing = data.find(m => m.id === upload.model.id);
            if (existing) {
              return [...prev, { state: "existing", model: existing }];
            }
            return prev;
          }
          // If the upload is not in the existing or uploaded state, simply leave it in state.
          return [...prev, upload];
        }, []),
      ];
    });
  }, []);

  const addRejectedFiles = useCallback((files: FileRejection[]) => {
    setUploads(curr => [
      ...files.map(f => {
        const uploadId = createUploadId();
        return {
          file: f.file,
          uploadId,
          state: "rejected" as const,
          errors: getRejectedFileErrors(f),
        };
      }),
      ...curr,
    ]);
  }, []);

  const uploadFile = useCallback(
    async (file: FileWithPath) => {
      const uploadId = createUploadId();
      setUploads(curr => [{ file, uploadId, state: "uploading" }, ...curr]);

      const formData = new FormData();
      formData.append("file", file);

      let response: M | ApiClientGlobalErrorJson;
      try {
        response = await uploadAction(formData, { sync });
      } catch (e) {
        logger.error(`There was a server error while uploading file ${file.name}:\n${e}`, {
          error: e,
          file,
        });
        return modifyUpload(uploadId, { errors: ["There was an error uploading the file."] });
      }
      if (isApiClientGlobalErrorJson(response)) {
        logger.error(`There was a client error while uploading file ${file.name}.`, {
          response,
          file,
        });
        return modifyUpload(uploadId, { errors: [response.message] });
      }
      logger.info(`File ${file.name} successfully uploaded, adding file to finished uploads...`, {
        file,
        uploadId,
      });
      return modifyUpload(uploadId, { model: response });
    },
    [uploadAction, modifyUpload, sync],
  );

  const performUpload = useCallback(
    async (files: FileWithPath[]) => {
      setIsUploading(true);
      await Promise.all(files.map(f => uploadFile(f)));
      setIsUploading(false);
    },
    [uploadFile],
  );

  return {
    isUploading,
    uploads,
    dismissRejectedUpload,
    dismissFailedUpload,
    performUpload,
    removeUpload,
    sync,
    addRejectedFiles,
    setIsUploading,
  };
};

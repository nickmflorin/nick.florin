import { type ErrorCode, type FileRejection, type FileError } from "react-dropzone-esm";

import { logger } from "~/application/logger";

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

export type RejectedFile = {
  readonly id: string;
  readonly file: FileRejection["file"];
  readonly errors: FileError[];
  readonly onClose: () => void;
};
